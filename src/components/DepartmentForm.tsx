import { useEffect } from "react";
import { Form, Input, Button, Space } from "antd";
import type {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from "../types/department";

interface DepartmentFormProps {
  department?: Department | null;
  onSubmit: (
    values: CreateDepartmentRequest | UpdateDepartmentRequest
  ) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
}

export function DepartmentForm({
  department,
  onSubmit,
  onCancel,
  loading = false,
  submitText,
  cancelText = "Hủy",
}: DepartmentFormProps) {
  const [form] = Form.useForm();
  const isEditing = !!department;

  const defaultSubmitText = isEditing ? "Cập nhật" : "Thêm";
  const finalSubmitText = submitText || `${defaultSubmitText} phòng ban`;

  const handleSubmit = async (values: any) => {
    try {
      if (isEditing && department) {
        const updateData: UpdateDepartmentRequest = {
          name: values.name,
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateDepartmentRequest = {
          name: values.name,
        };
        await onSubmit(createData);
      }
      form.resetFields();
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  useEffect(() => {
    if (department) {
      form.setFieldsValue({
        name: department.name,
      });
    } else {
      form.resetFields();
    }
  }, [department, form]);

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        label="Tên phòng ban"
        name="name"
        rules={[
          { required: true, message: "Vui lòng nhập tên phòng ban!" },
          { min: 2, message: "Tên phòng ban phải có ít nhất 2 ký tự!" },
          { max: 100, message: "Tên phòng ban không được quá 100 ký tự!" },
        ]}
      >
        <Input placeholder="Nhập tên phòng ban (VD: Human Resources)" />
      </Form.Item>

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
