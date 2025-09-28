import { useState } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Card,
  Typography,
  Modal,
  Tag,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useShiftSlots,
  useDeleteShiftSlot,
  useCreateShiftSlot,
  useCreateManyShiftSlots,
  useUpdateShiftSlot,
} from "../queries/shiftSlot.queries";
import { useBranches } from "../queries/branch.queries";
import { useShiftSlotTypes } from "../queries/shiftSlotType.queries";
import { ShiftSlotForm } from "./ShiftSlotForm";
import type { ShiftSlot, ShiftSlotList } from "../types/shiftSlot";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export function ShiftSlotTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [branchId, setBranchId] = useState<string>();
  const [typeId, setTypeId] = useState<string>();
  const [dateRange, setDateRange] = useState<[string, string]>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShiftSlot, setEditingShiftSlot] = useState<ShiftSlot | null>(
    null
  );

  const { data, isLoading } = useShiftSlots({
    page: currentPage,
    limit: pageSize,
    branchId,
    typeId,
    startDate: dateRange?.[0],
    endDate: dateRange?.[1],
  });

  const { data: branchesData } = useBranches({
    page: 1,
    limit: 1000,
  });

  const { data: shiftSlotTypesData } = useShiftSlotTypes({
    page: 1,
    limit: 1000,
  });

  const deleteShiftSlotMutation = useDeleteShiftSlot();
  const createShiftSlotMutation = useCreateShiftSlot();
  const createManyShiftSlotsMutation = useCreateManyShiftSlots();
  const updateShiftSlotMutation = useUpdateShiftSlot();

  const handleDelete = async (id: string) => {
    try {
      await deleteShiftSlotMutation.mutateAsync(id);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleEdit = (shiftSlot: ShiftSlot) => {
    setEditingShiftSlot(shiftSlot);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingShiftSlot(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingShiftSlot(null);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingShiftSlot) {
        await updateShiftSlotMutation.mutateAsync({
          id: editingShiftSlot.id,
          data: formData,
        });
      } else {
        await createShiftSlotMutation.mutateAsync(formData);
      }
      handleModalClose();
    } catch (error) {
      // Error is handled by the mutations
    }
  };

  const handleFormSubmitMany = async (formData: any) => {
    try {
      await createManyShiftSlotsMutation.mutateAsync(formData);
      handleModalClose();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange([
        dates[0].format("YYYY-MM-DD"),
        dates[1].format("YYYY-MM-DD"),
      ]);
    } else {
      setDateRange(undefined);
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setBranchId(undefined);
    setTypeId(undefined);
    setDateRange(undefined);
    setCurrentPage(1);
  };

  const columns: ColumnsType<ShiftSlotList> = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <Tag color="blue">{dayjs(date).format("DD/MM/YYYY")}</Tag>
      ),
      sorter: true,
    },
    {
      title: "Loại ca",
      key: "shiftSlotType",
      dataIndex: ["type", "name"],
      render: (value: string | undefined) => (
        <div>
          <Typography.Text strong>{value || "N/A"}</Typography.Text>
        </div>
      ),
    },
    {
      title: "Chi nhánh",
      key: "branch",
      render: (_, record) => (
        <Tag color="green">{record.branch?.name || "N/A"}</Tag>
      ),
    },
    {
      title: "Sức chứa",
      dataIndex: "capacity",
      key: "capacity",
      render: (capacity: number) => (
        <Statistic
          value={capacity}
          suffix="người"
          valueStyle={{ fontSize: "14px" }}
        />
      ),
      sorter: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note: string) => (
        <Typography.Text ellipsis={{ tooltip: note }}>
          {note || "-"}
        </Typography.Text>
      ),
      width: 150,
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
            description="Bạn có chắc chắn muốn xóa ca làm việc này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleteShiftSlotMutation.isPending}
              title="Xóa"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <Title level={4} className="m-0">
          Quản lý Ca Làm Việc
        </Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Thêm ca làm việc
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card size="small" className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Chọn chi nhánh"
              value={branchId}
              onChange={setBranchId}
              allowClear
              className="w-full"
            >
              {branchesData?.data?.map((branch) => (
                <Select.Option key={branch.id} value={branch.id}>
                  {branch.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Chọn loại ca"
              value={typeId}
              onChange={setTypeId}
              allowClear
              className="w-full"
            >
              {shiftSlotTypesData?.data?.map((type) => (
                <Select.Option key={type.id} value={type.id}>
                  {type.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              placeholder={["Từ ngày", "Đến ngày"]}
              format="DD/MM/YYYY"
              onChange={handleDateRangeChange}
              className="w-full"
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button onClick={handleClearFilters} className="w-full">
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={data?.data}
        rowKey="id"
        loading={isLoading}
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
        title={editingShiftSlot ? "Chỉnh sửa ca làm việc" : "Thêm ca làm việc"}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        <ShiftSlotForm
          shiftSlot={editingShiftSlot}
          onSubmit={handleFormSubmit}
          onSubmitMany={handleFormSubmitMany}
          onCancel={handleModalClose}
          loading={
            createShiftSlotMutation.isPending ||
            createManyShiftSlotsMutation.isPending ||
            updateShiftSlotMutation.isPending
          }
        />
      </Modal>
    </Card>
  );
}
