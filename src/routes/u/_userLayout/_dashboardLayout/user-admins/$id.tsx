import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Typography,
  Popconfirm,
  message,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  useUserAdmin,
  useUpdateUserAdmin,
  useDeleteUserAdmin,
} from "@/queries/userAdmin.queries";
import { UserAdminForm } from "@/components/userAdmin/UserAdminForm";
import { useState } from "react";
import { Modal } from "antd";
import type { UpdateUserAdminDto } from "@/types/userAdmin";

const { Title, Text } = Typography;

export const Route = createFileRoute(
  "/u/_userLayout/_dashboardLayout/user-admins/$id",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: userAdmin, isLoading, error } = useUserAdmin(id);
  const updateMutation = useUpdateUserAdmin();
  const deleteMutation = useDeleteUserAdmin();

  const handleUpdate = async (data: UpdateUserAdminDto) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      setEditModalOpen(false);
    } catch {
      // Handled by mutation
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      router.navigate({ to: "/u/user-admins" });
    } catch {
      // Handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !userAdmin) {
    message.error("Không tìm thấy user admin");
    return (
      <Card>
        <Space>
          <Link to="/u/user-admins">
            <Button icon={<ArrowLeftOutlined />}>Quay lại danh sách</Button>
          </Link>
        </Space>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <Space className="mb-4" wrap>
          <Link to="/u/user-admins">
            <Button icon={<ArrowLeftOutlined />}>Quay lại danh sách</Button>
          </Link>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setEditModalOpen(true)}
          >
            Chỉnh sửa
          </Button>
          <Popconfirm
            title="Xóa User Admin"
            description="Bạn có chắc chắn muốn xóa user admin này?"
            onConfirm={handleDelete}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>

        <Title level={4}>Chi tiết User Admin</Title>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="ID">
            <Text
              copyable={{ text: userAdmin.id }}
              className="font-mono text-xs"
            >
              {userAdmin.id}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tên hiển thị">
            {userAdmin.name}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {userAdmin.account?.email ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {userAdmin.phone ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Username">
            {userAdmin.account?.username ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(userAdmin.createdAt).toLocaleString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {new Date(userAdmin.updatedAt).toLocaleString("vi-VN")}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="Cập nhật User Admin"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        <UserAdminForm
          userAdmin={userAdmin}
          onSubmit={handleUpdate}
          onCancel={() => setEditModalOpen(false)}
          loading={updateMutation.isPending}
        />
      </Modal>
    </div>
  );
}
