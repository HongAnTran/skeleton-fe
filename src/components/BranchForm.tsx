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
    try {
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
    } catch (error) {
      // Error handling is done by parent component
    }
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
          { required: true, message: "Please input the branch name!" },
          { min: 2, message: "Branch name must be at least 2 characters!" },
        ]}
      >
        <Input placeholder="Enter branch name" />
      </Form.Item>

      <Form.Item
        label="Địa chỉ"
        name="address"
        rules={[{ min: 5, message: "Address must be at least 5 characters!" }]}
      >
        <Input.TextArea
          placeholder="Enter branch address (optional)"
          rows={3}
        />
      </Form.Item>

      <Form.Item label="Trạng thái" name="active" valuePropName="checked">
        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
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
