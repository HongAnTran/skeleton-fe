import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { VoucherRuleService } from "@/services/voucher-rule.service";
import type {
  CreateVoucherRuleBody,
  VoucherRule,
  VoucherRuleConditionType,
} from "@/types/voucher-rule";

const { Title, Text } = Typography;

export const Route = createFileRoute("/admin/_reportLayout/voucher-rules")({
  component: VoucherRulesPage,
});

const CONDITION_OPTIONS: { value: VoucherRuleConditionType; label: string }[] =
  [
    { value: "INVOICE_COUNT_TIER", label: "Số hóa đơn (tier)" },
    { value: "WARRANTY_ACTIVE", label: "Bảo hành còn hạn" },
  ];

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

function VoucherRulesPage() {
  const queryClient = useQueryClient();
  const [filterForm] = Form.useForm<{
    conditionType?: VoucherRuleConditionType | null;
    isActive?: boolean | "all";
  }>();
  const [modalForm] = Form.useForm<CreateVoucherRuleBody>();

  const [filters, setFilters] = useState<{
    conditionType?: VoucherRuleConditionType;
    isActive?: boolean;
  }>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VoucherRule | null>(null);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["voucher-rules", filters],
    queryFn: () => VoucherRuleService.list(filters),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["voucher-rules"] });

  const createMutation = useMutation({
    mutationFn: (body: CreateVoucherRuleBody) =>
      VoucherRuleService.create(body),
    onSuccess: () => {
      message.success("Đã tạo rule");
      invalidate();
      closeModal();
    },
    onError: (e: { message?: string }) =>
      message.error(e?.message || "Không tạo được rule"),
  });

  const patchMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof VoucherRuleService.patch>[1];
    }) => VoucherRuleService.patch(id, body),
    onSuccess: () => {
      message.success("Đã cập nhật rule");
      invalidate();
      closeModal();
    },
    onError: (e: { message?: string }) =>
      message.error(e?.message || "Không cập nhật được rule"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => VoucherRuleService.remove(id),
    onSuccess: () => {
      message.success("Đã xóa rule");
      invalidate();
    },
    onError: (e: { message?: string }) =>
      message.error(e?.message || "Không xóa được rule"),
  });

  const openCreate = () => {
    setEditing(null);
    modalForm.resetFields();
    modalForm.setFieldsValue({
      isActive: true,
      flags: [],
    });
    setModalOpen(true);
  };

  const openEdit = (row: VoucherRule) => {
    setEditing(row);
    modalForm.setFieldsValue({
      name: row.name,
      conditionType: row.conditionType,
      conditionValue: row.conditionValue,
      discountVnd: row.discountVnd,
      flags: row.flags?.length ? row.flags : [],
      isActive: row.isActive,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    modalForm.resetFields();
  };

  const submitModal = async () => {
    const values = await modalForm.validateFields();
    const flags = (values.flags ?? []).filter(Boolean);
    const body: CreateVoucherRuleBody = {
      name: values.name.trim(),
      conditionType: values.conditionType,
      conditionValue: values.conditionValue.trim(),
      discountVnd: values.discountVnd,
      flags,
      isActive: values.isActive ?? true,
    };

    if (editing) {
      patchMutation.mutate({ id: editing.id, body });
    } else {
      createMutation.mutate(body);
    }
  };

  const applyFilters = (v: {
    conditionType?: VoucherRuleConditionType | null;
    isActive?: boolean | "all";
  }) => {
    setFilters({
      ...(v.conditionType ? { conditionType: v.conditionType } : {}),
      ...(v.isActive !== undefined && v.isActive !== "all"
        ? { isActive: v.isActive }
        : {}),
    });
  };

  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại",
      dataIndex: "conditionType",
      key: "conditionType",
      width: 180,
      render: (t: VoucherRuleConditionType) =>
        CONDITION_OPTIONS.find((o) => o.value === t)?.label ?? t,
    },
    {
      title: "Giá trị điều kiện",
      dataIndex: "conditionValue",
      key: "conditionValue",
      ellipsis: true,
    },
    {
      title: "Giảm (VND)",
      dataIndex: "discountVnd",
      key: "discountVnd",
      width: 140,
      render: (n: number) => formatVnd(n),
    },
    {
      title: "Flags",
      dataIndex: "flags",
      key: "flags",
      width: 160,
      render: (flags: string[]) =>
        flags?.length ? (
          <Space size={[0, 4]} wrap>
            {flags.map((f) => (
              <Tag key={f}>{f}</Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Bật",
      dataIndex: "isActive",
      key: "isActive",
      width: 80,
      render: (active: boolean) => (
        <Tag color={active ? "green" : "default"}>
          {active ? "Có" : "Tắt"}
        </Tag>
      ),
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (iso: string) => dayjs(iso).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "",
      key: "actions",
      width: 140,
      render: (_: unknown, row: VoucherRule) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(row)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa rule này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteMutation.mutate(row.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-sm mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <Title level={4} className="!mb-0">
              <GiftOutlined className="mr-2" />
              Voucher rules
            </Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm rule
            </Button>
          </div>
          <Form
            form={filterForm}
            layout="inline"
            className="flex flex-wrap gap-3 items-end"
            onFinish={applyFilters}
            initialValues={{ isActive: "all" as const }}
          >
            <Form.Item name="conditionType" label="Loại" className="!mb-0">
              <Select
                allowClear
                placeholder="Tất cả"
                className="min-w-[200px]"
                options={CONDITION_OPTIONS}
              />
            </Form.Item>
            <Form.Item name="isActive" label="Trạng thái" className="!mb-0">
              <Select
                className="min-w-[140px]"
                options={[
                  { value: "all", label: "Tất cả" },
                  { value: true, label: "Đang bật" },
                  { value: false, label: "Đã tắt" },
                ]}
              />
            </Form.Item>
            <Form.Item className="!mb-0">
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card className="shadow-sm">
          <Table<VoucherRule>
            rowKey="id"
            loading={isLoading}
            dataSource={rules}
            columns={columns}
            pagination={{ pageSize: 20, showSizeChanger: true }}
            scroll={{ x: 960 }}
          />
        </Card>

        <Modal
          title={editing ? "Sửa voucher rule" : "Thêm voucher rule"}
          open={modalOpen}
          onCancel={closeModal}
          onOk={submitModal}
          confirmLoading={createMutation.isPending || patchMutation.isPending}
          destroyOnClose
          width={560}
        >
          <Form
            form={modalForm}
            layout="vertical"
            className="mt-2"
            initialValues={{ isActive: true, flags: [] }}
          >
            <Form.Item
              name="name"
              label="Tên hiển thị"
              rules={[{ required: true, message: "Nhập tên" }]}
            >
              <Input placeholder="VD: Khách thân thiết - 5+ hóa đơn" />
            </Form.Item>
            <Form.Item
              name="conditionType"
              label="Loại điều kiện"
              rules={[{ required: true, message: "Chọn loại" }]}
            >
              <Select options={CONDITION_OPTIONS} />
            </Form.Item>
            <Form.Item
              name="conditionValue"
              label="Giá trị điều kiện"
              rules={[{ required: true, message: "Nhập giá trị" }]}
              extra="Tier: số nguyên (VD 3). Bảo hành: tên gói đúng như hệ thống."
            >
              <Input placeholder='VD: "5" hoặc tên gói bảo hành' />
            </Form.Item>
            <Form.Item
              name="discountVnd"
              label="Số tiền giảm (VND)"
              rules={[{ required: true, message: "Nhập số tiền" }]}
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item
              name="flags"
              label="Flags (tùy chọn)"
              extra="Nhập và Enter để thêm (VD: careProMax)"
            >
              <Select mode="tags" placeholder="Flags" className="w-full" />
            </Form.Item>
            <Form.Item name="isActive" label="Đang bật" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
