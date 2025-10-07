import { useEffect } from "react";
import { Form, Input, Button, Space, Switch } from "antd";
import type {
  Branch,
  CreateBranchRequest,
  UpdateBranchRequest,
} from "../types/branch";

interface BranchFormProps {
  branch?: Branch | null;
  onSubmit: (
    values: CreateBranchRequest | UpdateBranchRequest
  ) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
}

export function BranchForm({
  branch,
  onSubmit,
  onCancel,
  loading = false,
  submitText,
  cancelText = "Hủy",
}: BranchFormProps) {
  const [form] = Form.useForm();
  const isEditing = !!branch;

  const defaultSubmitText = isEditing ? "Cập nhật" : "Thêm";
  const finalSubmitText = submitText || `${defaultSubmitText} chi nhánh`;

  const handleSubmit = async (values: any) => {
    if (isEditing && branch) {
      const updateData: UpdateBranchRequest = {
        name: values.name,
        address: values.address,
        active: values.active,
      };
      await onSubmit(updateData);
    } else {
      const createData: CreateBranchRequest = {
        name: values.name,
        address: values.address,
        active: values.active ?? true,
      };
      await onSubmit(createData);
    }
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  useEffect(() => {
    if (branch) {
      form.setFieldsValue({
        name: branch.name,
        address: branch.address,
        active: branch.active,
      });
    } else {
      form.resetFields();
    }
  }, [branch, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ active: true }}
    >
      <Form.Item
        label="Tên chi nhánh"
        name="name"
        rules={[
          { required: true, message: "Vui lòng nhập tên chi nhánh!" },
          { min: 2, message: "Tên chi nhánh phải có ít nhất 2 ký tự!" },
        ]}
      >
        <Input placeholder="Nhập tên chi nhánh" />
      </Form.Item>

      <Form.Item label="Trạng thái" name="active" valuePropName="checked">
        <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
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
