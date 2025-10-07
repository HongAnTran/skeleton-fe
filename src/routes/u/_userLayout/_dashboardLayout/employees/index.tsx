import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Input,
  Select,
  Tag,
  Modal,
  Popconfirm,
  message,
  Avatar,
  Tooltip,
  Divider,
} from "antd";
import type { TableProps, TableColumnsType } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  EyeOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from "../../../../../queries/employee.queries";
import { useBranches } from "../../../../../queries/branch.queries";
import { useDepartments } from "../../../../../queries/department.queries";
import { EmployeeForm } from "../../../../../components/emmployee/EmployeeForm";
import type {
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "../../../../../types/employee";

const { Title, Text } = Typography;
const { Search } = Input;

interface EmployeeModalProps {
  open: boolean;
  onCancel: () => void;
  employee: Employee | null;
  onSuccess: () => void;
}

function EmployeeModal({
  open,
  onCancel,
  employee,
  onSuccess,
}: EmployeeModalProps) {
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();

  const isEditing = !!employee;
  const isLoading =
    createEmployeeMutation.isPending || updateEmployeeMutation.isPending;

  const handleSubmit = async (data: CreateEmployeeDto | UpdateEmployeeDto) => {
    try {
      if (isEditing && employee) {
        await updateEmployeeMutation.mutateAsync({
          id: employee.id,
          data: data as UpdateEmployeeDto,
        });
      } else {
        await createEmployeeMutation.mutateAsync(data as CreateEmployeeDto);
      }
      onSuccess();
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          {isEditing ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnHidden
    >
      <Divider />
      <EmployeeForm
        employee={employee}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        loading={isLoading}
      />
    </Modal>
  );
}

interface EmployeeDetailModalProps {
  open: boolean;
  onCancel: () => void;
  employee: Employee | null;
  onEdit: (employee: Employee) => void;
}

function EmployeeDetailModal({
  open,
  onCancel,
  employee,
  onEdit,
}: EmployeeDetailModalProps) {
  if (!employee) return null;

  return (
    <Modal
      title={
        <Space>
          <Avatar src={employee.avatar} icon={<UserOutlined />} size="small" />
          <Text strong>{employee.name}</Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
        <Button
          key="edit"
          type="primary"
          icon={<EditOutlined />}
          onClick={() => onEdit(employee)}
        >
          Chỉnh sửa
        </Button>,
      ]}
      width={600}
    >
      <Divider />
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Text type="secondary">ID:</Text>
          <br />
          <Text copyable={{ text: employee.id }}>
            {employee.id.slice(0, 8)}...
          </Text>
        </Col>
        <Col span={12}>
          <Text type="secondary">Email:</Text>
          <br />
          <Text>{employee.account?.email || "Chưa có email"}</Text>
        </Col>
        <Col span={12}>
          <Text type="secondary">Số điện thoại:</Text>
          <br />
          <Text>{employee.phone || "Chưa có số điện thoại"}</Text>
        </Col>
        <Col span={12}>
          <Text type="secondary">Cấp độ hiện tại:</Text>
          <br />
          <Tag color="blue">Level {employee.currentLevel}</Tag>
        </Col>
        <Col span={12}>
          <Text type="secondary">Chi nhánh:</Text>
          <br />
          <Text>{employee.branch?.name || "Chưa được phân công"}</Text>
        </Col>
        <Col span={12}>
          <Text type="secondary">Phòng ban:</Text>
          <br />
          <Text>{employee.department?.name || "Chưa được phân công"}</Text>
        </Col>
        <Col span={12}>
          <Text type="secondary">Trạng thái:</Text>
          <br />
          <Tag color={employee.active ? "green" : "red"}>
            {employee.active ? "Hoạt động" : "Ngưng hoạt động"}
          </Tag>
        </Col>
        <Col span={12}>
          <Text type="secondary">Ngày tạo:</Text>
          <br />
          <Text>{new Date(employee.createdAt).toLocaleString("vi-VN")}</Text>
        </Col>
      </Row>
    </Modal>
  );
}

export const Route = createFileRoute(
  "/u/_userLayout/_dashboardLayout/employees/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>();
  const [selectedDepartment, setSelectedDepartment] = useState<
    string | undefined
  >();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  const deleteEmployeeMutation = useDeleteEmployee();

  // Fetch employees with current filters
  const {
    data: employeesData,
    isLoading,
    error,
  } = useEmployees({
    page: currentPage,
    limit: pageSize,
    branchId: selectedBranch,
    departmentId: selectedDepartment,
  });

  // Fetch branches and departments for filters
  const { data: branchesData } = useBranches({ page: 1, limit: 1000 });
  const { data: departmentsData } = useDepartments({ page: 1, limit: 1000 });

  // Filter by search term (client-side for name/email search)
  const filteredEmployees =
    employeesData?.data?.filter((employee: Employee) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        employee.name.toLowerCase().includes(searchLower) ||
        employee.account?.email?.toLowerCase().includes(searchLower) ||
        employee.phone?.toLowerCase().includes(searchLower)
      );
    }) || [];

  const handleTableChange: TableProps<Employee>["onChange"] = (pagination) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmployeeMutation.mutateAsync(id);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleModalSuccess = () => {
    setIsCreateModalOpen(false);
    setEditingEmployee(null);
  };

  const handleDetailModalEdit = (employee: Employee) => {
    setIsDetailModalOpen(false);
    setViewingEmployee(null);
    handleEdit(employee);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleClearFilters = () => {
    setSelectedBranch(undefined);
    setSelectedDepartment(undefined);
    setSearchTerm("");
  };

  const columns: TableColumnsType<Employee> = [
    {
      title: "Nhân viên",
      key: "employee",
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} size="default" />
          <div>
            <div className="font-medium">{record.name}</div>
            <Text type="secondary" className="text-xs">
              {record.account?.email || "Chưa có email"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Thông tin liên hệ",
      key: "contact",
      width: 180,
      render: (_, record) => (
        <div>
          <div>{record.phone || "Chưa có SĐT"}</div>
          <Text type="secondary" className="text-xs">
            Level {record.currentLevel}
          </Text>
        </div>
      ),
    },
    {
      title: "Chi nhánh",
      dataIndex: ["branch", "name"],
      key: "branch",
      width: 150,
      render: (branchName) =>
        branchName || <Text type="secondary">Chưa phân công</Text>,
      filters:
        branchesData?.data?.map((branch: any) => ({
          text: branch.name,
          value: branch.id,
        })) || [],
      filteredValue: selectedBranch ? [selectedBranch] : null,
    },
    {
      title: "Phòng ban",
      dataIndex: ["department", "name"],
      key: "department",
      width: 150,
      render: (departmentName) =>
        departmentName || <Text type="secondary">Chưa phân công</Text>,
      filters:
        departmentsData?.data?.map((department: any) => ({
          text: department.name,
          value: department.id,
        })) || [],
      filteredValue: selectedDepartment ? [selectedDepartment] : null,
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      width: 120,
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Hoạt động" : "Ngưng hoạt động"}
        </Tag>
      ),
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Ngưng hoạt động", value: false },
      ],
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 90,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Link to="/u/employees/$id" params={{ id: record.id }}>
              <Button type="text" icon={<EyeOutlined />} size="small" />
            </Link>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa nhân viên"
              description="Bạn có chắc chắn muốn xóa nhân viên này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (error) {
    message.error("Không thể tải danh sách nhân viên");
  }

  return (
    <div>
      <Card>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Title level={3} className="mb-0">
              Quản lý nhân viên
            </Title>
            <Text type="secondary">
              Tổng số: {employeesData?.meta?.total || 0} nhân viên
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                title="Làm mới dữ liệu"
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Thêm nhân viên
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Filters Section */}
        <Card
          size="small"
          className="mb-4"
          title={
            <>
              <FilterOutlined /> Bộ lọc
            </>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Search
                placeholder="Tìm kiếm tên, email, SĐT..."
                allowClear
                enterButton={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={setSearchTerm}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Select
                placeholder="Chọn chi nhánh"
                allowClear
                style={{ width: "100%" }}
                value={selectedBranch}
                onChange={setSelectedBranch}
              >
                {branchesData?.data?.map((branch: any) => (
                  <Select.Option key={branch.id} value={branch.id}>
                    {branch.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={6}>
              <Select
                placeholder="Chọn phòng ban"
                allowClear
                style={{ width: "100%" }}
                value={selectedDepartment}
                onChange={setSelectedDepartment}
              >
                {departmentsData?.data?.map((department: any) => (
                  <Select.Option key={department.id} value={department.id}>
                    {department.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={4}>
              <Button onClick={handleClearFilters} block>
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card>

        <Table<Employee>
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: employeesData?.meta?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} nhân viên`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 1200 }}
          size="middle"
          bordered
        />

        {/* Create/Edit Modal */}
        <EmployeeModal
          open={isCreateModalOpen}
          onCancel={() => setIsCreateModalOpen(false)}
          employee={editingEmployee}
          onSuccess={handleModalSuccess}
        />

        <EmployeeDetailModal
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          employee={viewingEmployee}
          onEdit={handleDetailModalEdit}
        />
      </Card>
    </div>
  );
}
