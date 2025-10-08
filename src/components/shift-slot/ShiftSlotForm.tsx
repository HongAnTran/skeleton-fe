import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Divider,
  Checkbox,
} from "antd";
import dayjs from "dayjs";
import type {
  ShiftSlot,
  CreateShiftSlotDto,
  UpdateShiftSlotDto,
} from "../../types/shiftSlot";
import { useBranches } from "../../queries/branch.queries";
import { useShiftSlotTypes } from "../../queries/shiftSlotType.queries";
import { useDepartments } from "../../queries/department.queries";

interface ShiftSlotFormProps {
  shiftSlot?: ShiftSlot | null;
  onSubmit: (data: CreateShiftSlotDto | UpdateShiftSlotDto) => Promise<void>;
  onSubmitMany?: (data: CreateShiftSlotDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
}

export function ShiftSlotForm({
  shiftSlot,
  onSubmit,
  onSubmitMany,
  onCancel,
  loading = false,
  submitText,
  cancelText = "Hủy",
}: ShiftSlotFormProps) {
  const [form] = Form.useForm();
  const [createMultiple, setCreateMultiple] = useState(false);

  const isEditing = !!shiftSlot;
  const defaultSubmitText = isEditing
    ? "Cập nhật"
    : createMultiple
      ? "Thêm nhiều"
      : "Thêm";
  const finalSubmitText = submitText || `${defaultSubmitText} ca làm việc`;

  const { data: branchesData, isLoading: branchesLoading } = useBranches(
    {
      page: 1,
      limit: 1000,
    },
    {
      onSuccess: (data) => {
        form.setFieldsValue({
          branchId: data.data[0].id,
        });
      },
    }
  );
  const { data: departmentsData, isLoading: departmentsLoading } =
    useDepartments({
      page: 1,
      limit: 1000,
    });

  const { data: shiftSlotTypesData, isLoading: shiftSlotTypesLoading } =
    useShiftSlotTypes({
      page: 1,
      limit: 1000,
    });

  const handleSubmit = async (values: any) => {
    try {
      const date = values.date.format("YYYY-MM-DD");

      if (isEditing && shiftSlot) {
        const updateData: UpdateShiftSlotDto = {
          capacity: values.capacity,
          note: values.note || undefined,
          typeId: values.typeIds,
        };
        await onSubmit(updateData);
      } else if (createMultiple && values.endDate && onSubmitMany) {
        const endDate = values.endDate.format("YYYY-MM-DD");
        const createManyData: CreateShiftSlotDto = {
          departmentIds: values.departmentIds,
          branchId: values.branchId,
          capacity: values.capacity,
          note: values.note || undefined,
          date,
          endDate,
          typeIds: values.typeIds,
        };
        await onSubmitMany(createManyData);
      } else {
        const createData: CreateShiftSlotDto = {
          departmentIds: values.departmentIds,
          branchId: values.branchId,
          capacity: values.capacity,
          note: values.note || undefined,
          date,
          typeIds: values.typeIds,
        };
        await onSubmit(createData);
      }
      setCreateMultiple(false);
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCreateMultiple(false);
    onCancel();
  };

  useEffect(() => {
    if (shiftSlot) {
      setCreateMultiple(false); // Disable bulk create when editing
      form.setFieldsValue({
        branchId: shiftSlot.branchId,
        departmentIds: shiftSlot.departmentId,
        capacity: shiftSlot.capacity,
        note: shiftSlot.note,
        date: dayjs(shiftSlot.date),
        typeIds: shiftSlot.type?.id,
      });
    } else {
      form.resetFields();
      // Set default values
      form.setFieldsValue({
        capacity: 1,
        date: dayjs(),
      });
    }
  }, [shiftSlot, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ capacity: 2 }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Chi nhánh"
            name="branchId"
            rules={[{ required: true, message: "Vui lòng chọn chi nhánh!" }]}
          >
            <Select
              disabled={isEditing}
              placeholder="Chọn chi nhánh"
              loading={branchesLoading}
              showSearch
              optionFilterProp="children"
            >
              {branchesData?.data?.map((branch) => (
                <Select.Option key={branch.id} value={branch.id}>
                  {branch.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Phòng ban"
            name="departmentIds"
            rules={[{ required: true, message: "Vui lòng chọn phòng ban!" }]}
          >
            <Select
              disabled={isEditing}
              placeholder="Chọn phòng ban"
              loading={departmentsLoading}
              showSearch
              optionFilterProp="children"
              mode={!isEditing ? "multiple" : undefined}
            >
              {departmentsData?.data?.map((department) => (
                <Select.Option key={department.id} value={department.id}>
                  {department.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item

            label="Loại ca"
            name="typeIds"
            rules={[{ required: true, message: "Vui lòng chọn loại ca!" }]}
          >
            <Select
              mode={!isEditing ? "multiple" : undefined}
              placeholder="Chọn loại ca"
              loading={shiftSlotTypesLoading}
              showSearch
              optionFilterProp="children"
            >
              {shiftSlotTypesData?.data?.map((type) => (
                <Select.Option key={type.id} value={type.id}>
                  {type.name} ({dayjs(type.startDate).format("HH:mm")} -{" "}
                  {dayjs(type.endDate).format("HH:mm")})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {!isEditing && (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item>
              <Checkbox
                checked={createMultiple}
                onChange={(e) => {
                  setCreateMultiple(e.target.checked);
                  if (!e.target.checked) {
                    form.setFieldValue("endDate", undefined);
                  }
                }}
              >
                Tạo nhiều ca làm việc liên tiếp (từ ngày bắt đầu đến ngày kết
                thúc)
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>
      )}

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={createMultiple ? "Ngày bắt đầu" : "Ngày làm việc"}
            name="date"
            rules={[
              { required: true, message: "Vui lòng chọn ngày làm việc!" },
            ]}
          >

            <DatePicker
              placeholder="Chọn ngày"
              format="DD/MM/YYYY"
              className="w-full"
              disabled={isEditing}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>
        </Col>
        {createMultiple && (
          <Col span={12}>
            <Form.Item
              label="Ngày kết thúc"
              name="endDate"
              rules={[
                { required: true, message: "Vui lòng chọn ngày kết thúc!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startDate = getFieldValue("date");
                    if (!value || !startDate) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(startDate, "day")) {
                      return Promise.reject(
                        new Error("Ngày kết thúc phải sau ngày bắt đầu!")
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                placeholder="Chọn ngày kết thúc"
                format="DD/MM/YYYY"
                className="w-full"
                disabled={isEditing}
                disabledDate={(current) => {
                  const startDate = form.getFieldValue("date");
                  return (
                    (current && current < dayjs().startOf("day")) ||
                    (startDate && current && current.isBefore(startDate, "day"))
                  );
                }}
              />
            </Form.Item>
          </Col>
        )}
      </Row>
      <Col span={12}>
        <Form.Item
          label="Sức chứa"
          name="capacity"
          rules={[
            { required: true, message: "Vui lòng nhập sức chứa!" },
            {
              type: "number",
              min: 1,
              message: "Sức chứa phải ít nhất 1 người!",
            },
            {
              type: "number",
              max: 100,
              message: "Sức chứa không được quá 100 người!",
            },
          ]}
        >
          <InputNumber
            placeholder="Số lượng người tối đa"
            min={1}
            max={100}
            className="w-full"
          />
        </Form.Item>
      </Col>

      <Divider>Thông tin bổ sung</Divider>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea
              placeholder="Nhập ghi chú cho ca làm việc..."
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item className="mb-0">
        <Space className="w-full justify-end">
          <Button onClick={handleCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {finalSubmitText}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
