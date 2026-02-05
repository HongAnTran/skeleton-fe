import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Modal,
  Popconfirm,
  message,
  Tooltip,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  useUserAdmins,
  useCreateUserAdmin,
  useUpdateUserAdmin,
  useDeleteUserAdmin,
} from "@/queries/userAdmin.queries";
import { UserAdminForm } from "@/components/userAdmin/UserAdminForm";
import { Link } from "@tanstack/react-router";
import type {
  CreateUserAdminDto,
  UpdateUserAdminDto,
  UserAdmin,
} from "@/types/userAdmin";

const { Title, Text } = Typography;

interface UserAdminModalProps {
  open: boolean;
  onCancel: () => void;
  userAdmin: UserAdmin | null;
  onSuccess: () => void;
}

function UserAdminModal({
  open,
  onCancel,
  userAdmin,
  onSuccess,
}: UserAdminModalProps) {
  const createMutation = useCreateUserAdmin();
  const updateMutation = useUpdateUserAdmin();
  const isEditing = !!userAdmin;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (
    data: CreateUserAdminDto | UpdateUserAdminDto,
  ) => {
    try {
      if (isEditing && userAdmin) {
        await updateMutation.mutateAsync({
          id: userAdmin.id,
          data: data as UpdateUserAdminDto,
        });
      } else {
        await createMutation.mutateAsync(data as CreateUserAdminDto);
      }
      onSuccess();
    } catch {
      // Error handled by mutation onError
    }
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          {isEditing ? "Cập nhật User Admin" : "Thêm User Admin mới"}
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={640}
      destroyOnClose
    >
      <UserAdminForm
        userAdmin={userAdmin}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        loading={isLoading}
      />
    </Modal>
  );
}

export const Route = createFileRoute(
  "/u/_userLayout/_dashboardLayout/user-admins/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUserAdmin, setEditingUserAdmin] = useState<UserAdmin | null>(
    null,
  );

  const deleteMutation = useDeleteUserAdmin();

  const { data, isLoading, error } = useUserAdmins({
    page: currentPage,
    limit: pageSize,
  });

  const handleCreate = () => {
    setEditingUserAdmin(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (record: UserAdmin) => {
    setEditingUserAdmin(record);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // Handled by mutation
    }
  };

  const handleModalSuccess = () => {
    setIsCreateModalOpen(false);
    setEditingUserAdmin(null);
  };

  const columns: TableColumnsType<UserAdmin> = [
    {
      title: "User Admin",
      key: "userAdmin",
      width: 260,
      render: (_, record) => (
        <Space>
          <div>
            <div className="font-medium">{record.name}</div>
            <Text type="secondary" className="text-xs">
              {record.account?.email ?? "—"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 140,
      render: (phone: string | null) => phone ?? "—",
    },
    {
      title: "Username",
      key: "username",
      width: 140,
      render: (_, record) =>
        record.account?.username ?? <Text type="secondary">—</Text>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Link to="/u/user-admins/$id" params={{ id: record.id }}>
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
              title="Xóa User Admin"
              description="Bạn có chắc chắn muốn xóa user admin này?"
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
    message.error("Không thể tải danh sách user admin");
  }

  return (
    <div>
      <Card>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Title level={3} className="mb-0">
              Quản lý User Admin
            </Title>
            <Text type="secondary">
              Tổng số: {data?.meta?.total ?? 0} user admin
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
                title="Làm mới"
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Thêm User Admin
              </Button>
            </Space>
          </Col>
        </Row>

        <Table<UserAdmin>
          columns={columns}
          dataSource={data?.data ?? []}
          rowKey="id"
          loading={isLoading}
          onChange={(pagination) => {
            setCurrentPage(pagination.current ?? 1);
            setPageSize(pagination.pageSize ?? 10);
          }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: data?.meta?.total ?? 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} user admin`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 800 }}
          size="middle"
          bordered
        />

        <UserAdminModal
          open={isCreateModalOpen}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setEditingUserAdmin(null);
          }}
          userAdmin={editingUserAdmin}
          onSuccess={handleModalSuccess}
        />
      </Card>
    </div>
  );
}
