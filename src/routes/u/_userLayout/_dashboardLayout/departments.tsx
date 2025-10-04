import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  Modal,
  Input,
  Popconfirm,
  Typography,
  message,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { TableColumnsType, TableProps } from "antd";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "../../../../queries/department.queries";
import type {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from "../../../../types/department";
import { DepartmentForm } from "../../../../components";

const { Title } = Typography;
const { Search } = Input;

export const Route = createFileRoute(
  "/u/_userLayout/_dashboardLayout/departments"
)({
  component: RouteComponent,
});

interface DepartmentModalProps {
  open: boolean;
  onCancel: () => void;
  department?: Department | null;
  onSuccess: () => void;
}

function DepartmentModal({
  open,
  onCancel,
  department,
  onSuccess,
}: DepartmentModalProps) {
  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();

  const isEditing = !!department;
  const isLoading =
    createDepartmentMutation.isPending || updateDepartmentMutation.isPending;

  const handleSubmit = async (
    values: CreateDepartmentRequest | UpdateDepartmentRequest
  ) => {
    try {
      if (isEditing && department) {
        await updateDepartmentMutation.mutateAsync({
          id: department.id,
          data: values as UpdateDepartmentRequest,
        });
      } else {
        await createDepartmentMutation.mutateAsync(
          values as CreateDepartmentRequest
        );
      }
      onSuccess();
    } catch (error) {
      // Error handling is done by mutation hooks
    }
  };

  return (
    <Modal
      title={isEditing ? "Sửa phòng ban" : "Thêm phòng ban"}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <DepartmentForm
        department={department}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        loading={isLoading}
      />
    </Modal>
  );
}

function RouteComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );

  const deleteDepartmentMutation = useDeleteDepartment();

  const {
    data: departmentsData,
    isLoading,
    error,
  } = useDepartments({
    page: currentPage,
    limit: pageSize,
  });

  const filteredDepartments =
    departmentsData?.data?.filter((department: Department) =>
      department.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleTableChange: TableProps<Department>["onChange"] = (
    pagination
  ) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const handleCreate = () => {
    setEditingDepartment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDepartmentMutation.mutateAsync(id);
    } catch (error) {}
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
  };

  const columns: TableColumnsType<Department> = [
    {
      title: "Tên phòng ban",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string) => <strong>{text}</strong>,
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Hành động",
      key: "actions",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            title="Sửa phòng ban"
          />
          <Popconfirm
            title="Xóa phòng ban"
            description="Bạn có chắc chắn muốn xóa phòng ban này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xác nhận"
            cancelText="Hủy"
            placement="topRight"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              loading={deleteDepartmentMutation.isPending}
              size="small"
              title="Xóa phòng ban"
            />
          </Popconfirm>
        </Space>
      ),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
  ];

  if (error) {
    message.error("Failed to load departments");
  }

  return (
    <Card>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Title level={3} className="mb-0">
            Quản lý phòng ban
          </Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Thêm phòng ban
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Tìm kiếm phòng ban..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            onSearch={setSearchTerm}
          />
        </Col>
      </Row>

      <Table<Department>
        columns={columns}
        dataSource={filteredDepartments}
        rowKey="id"
        loading={isLoading}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: departmentsData?.meta.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} phòng ban`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        scroll={{ x: 800 }}
        size="middle"
        bordered
      />

      <DepartmentModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        department={editingDepartment}
        onSuccess={handleModalSuccess}
      />
    </Card>
  );
}
