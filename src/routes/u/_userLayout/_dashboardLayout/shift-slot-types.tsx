import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Input,
  Card,
  Typography,
  Modal,
  Tag,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import type { ShiftSlotType } from "@/types/shiftSlotType";
import {
  useCreateShiftSlotType,
  useDeleteShiftSlotType,
  useShiftSlotTypes,
  useUpdateShiftSlotType,
} from "@/queries/shiftSlotType.queries";
import { ShiftSlotTypeForm } from "@/components";

const { Title } = Typography;
const { Search } = Input;
export const Route = createFileRoute(
  "/u/_userLayout/_dashboardLayout/shift-slot-types"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShiftSlotType, setEditingShiftSlotType] =
    useState<ShiftSlotType | null>(null);

  const { data, isLoading } = useShiftSlotTypes({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
  });

  const deleteShiftSlotTypeMutation = useDeleteShiftSlotType();
  const createShiftSlotTypeMutation = useCreateShiftSlotType();
  const updateShiftSlotTypeMutation = useUpdateShiftSlotType();

  const handleDelete = async (id: string) => {
    try {
      await deleteShiftSlotTypeMutation.mutateAsync(id);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleEdit = (shiftSlotType: ShiftSlotType) => {
    setEditingShiftSlotType(shiftSlotType);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingShiftSlotType(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingShiftSlotType(null);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingShiftSlotType) {
        await updateShiftSlotTypeMutation.mutateAsync({
          id: editingShiftSlotType.id,
          data: formData,
        });
      } else {
        await createShiftSlotTypeMutation.mutateAsync(formData);
      }
      handleModalClose();
    } catch (error) {
      // Error is handled by the mutations
    }
  };

  const columns: ColumnsType<ShiftSlotType> = [
    {
      title: "Tên loại ca",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (text: string) => (
        <Typography.Text strong>{text}</Typography.Text>
      ),
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) => (
        <Tag color="green">{dayjs(date).format("HH:mm")}</Tag>
      ),
      sorter: true,
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date: string) => (
        <Tag color="red">{dayjs(date).format("HH:mm")}</Tag>
      ),
    },
    {
      title: "Thời lượng",
      key: "duration",
      render: (_, record) => {
        const start = dayjs(record.startDate);
        const end = dayjs(record.endDate);
        const durationHours = end.diff(start, "hours", true);
        return <Tag color="blue">{durationHours.toFixed(1)} giờ</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      sorter: true,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa loại ca này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleteShiftSlotTypeMutation.isPending}
              title="Xóa"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div className="mb-4 flex flex-col md:flex-row items-center justify-between">
        <Title level={4} className="m-0">
          Quản lý Loại Ca Làm Việc
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm loại ca
        </Button>
      </div>

      <div className="mb-4">
        <Search
          placeholder="Tìm kiếm theo tên loại ca..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={setSearchTerm}
          onChange={(e) => {
            if (!e.target.value) {
              setSearchTerm("");
            }
          }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data?.data}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1000 }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data?.meta?.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} mục`,
          onChange: setCurrentPage,
          onShowSizeChange: (_, size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
      />

      <Modal
        title={editingShiftSlotType ? "Chỉnh sửa loại ca" : "Thêm loại ca"}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <ShiftSlotTypeForm
          shiftSlotType={editingShiftSlotType}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
          loading={
            createShiftSlotTypeMutation.isPending ||
            updateShiftSlotTypeMutation.isPending
          }
        />
      </Modal>
    </Card>
  );
}
