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
  Tag,
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
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
} from "../../../../queries/branch.queries";
import type {
  Branch,
  CreateBranchRequest,
  UpdateBranchRequest,
} from "../../../../types/branch";
import { BranchForm } from "../../../../components";

const { Title } = Typography;
const { Search } = Input;

export const Route = createFileRoute("/u/_userLayout/_dashboardLayout/branchs")(
  {
    component: RouteComponent,
  }
);

interface BranchModalProps {
  open: boolean;
  onCancel: () => void;
  branch?: Branch | null;
  onSuccess: () => void;
}

function BranchModal({ open, onCancel, branch, onSuccess }: BranchModalProps) {
  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();

  const isEditing = !!branch;
  const isLoading =
    createBranchMutation.isPending || updateBranchMutation.isPending;

  const handleSubmit = async (
    values: CreateBranchRequest | UpdateBranchRequest
  ) => {
    try {
      if (isEditing && branch) {
        await updateBranchMutation.mutateAsync({
          id: branch.id,
          data: values as UpdateBranchRequest,
        });
      } else {
        await createBranchMutation.mutateAsync(values as CreateBranchRequest);
      }
      onSuccess();
    } catch (error) {
      // Error handling is done by mutation hooks
    }
  };

  return (
    <Modal
      title={isEditing ? "Sửa chi nhánh" : "Thêm chi nhánh"}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <BranchForm
        branch={branch}
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
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const deleteBranchMutation = useDeleteBranch();

  const {
    data: branchesData,
    isLoading,
    error,
  } = useBranches({
    page: currentPage,
    limit: pageSize,
  });

  const filteredBranches =
    branchesData?.data?.filter(
      (branch: Branch) =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleTableChange: TableProps<Branch>["onChange"] = (pagination) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const handleCreate = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBranchMutation.mutateAsync(id);
    } catch (error) {}
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
  };

  const columns: TableColumnsType<Branch> = [
    {
      title: "Tên chi nhánh",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      render: (text: string) => text || <em>No address provided</em>,
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Không hoạt động", value: false },
      ],
      onFilter: (value, record) => record.active === value,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 90,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Xóa chi nhánh"
            description="Bạn có chắc chắn muốn xóa chi nhánh này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xác nhận"
            cancelText="Hủy"
            placement="topRight"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              loading={deleteBranchMutation.isPending}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    message.error("Failed to load branches");
  }

  return (
    <Card>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Title level={3} className="mb-0">
            Quản lý chi nhánh
          </Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Thêm chi nhánh
          </Button>
        </Col>
      </Row>

      <Row gutter={16} className="mb-4">
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Tìm kiếm chi nhánh..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={setSearchTerm}
          />
        </Col>
      </Row>

      <Table<Branch>
        columns={columns}
        dataSource={filteredBranches}
        rowKey="id"
        loading={isLoading}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: branchesData?.meta.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} chi nhánh`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        scroll={{ x: 800 }}
        size="middle"
      />

      <BranchModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        branch={editingBranch}
        onSuccess={handleModalSuccess}
      />
    </Card>
  );
}
