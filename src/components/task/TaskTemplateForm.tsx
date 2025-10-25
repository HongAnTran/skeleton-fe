import React from "react";
import { Form, Input, Select, Switch, Button, Space } from "antd";
import {
  useCreateTaskTemplate,
  useUpdateTaskTemplate,
} from "../../queries/task.queries";
import type {
  TaskTemplate,
  CreateTaskTemplateDto,
  UpdateTaskTemplateDto,
} from "../../types/task";
import { TaskScope } from "../../types/task";
import { LEVEL_OPTIONS_SELECT } from "../../consts";

interface TaskTemplateFormProps {
  template?: TaskTemplate;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TaskTemplateForm: React.FC<TaskTemplateFormProps> = ({
  template,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!template;

  const createMutation = useCreateTaskTemplate();
  const updateMutation = useUpdateTaskTemplate();

  const handleSubmit = async (
    values: CreateTaskTemplateDto | UpdateTaskTemplateDto
  ) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: template!.id,
          data: values as UpdateTaskTemplateDto,
        });
      } else {
        await createMutation.mutateAsync(values as CreateTaskTemplateDto);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const scopeOptions = [
    { label: "Cá nhân", value: TaskScope.INDIVIDUAL },
    { label: "Phòng ban", value: TaskScope.DEPARTMENT },
  ];

  // const aggregationOptions = [
  //   { label: "Đếm", value: TaskAggregation.COUNT },
  //   { label: "Tổng", value: TaskAggregation.SUM },
  //   { label: "Trung bình", value: TaskAggregation.AVERAGE },
  //   { label: "Tối đa", value: TaskAggregation.MAX },
  //   { label: "Tối thiểu", value: TaskAggregation.MIN },
  // ];

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        title: template?.title || "",
        description: template?.description || "",
        scope: template?.scope || TaskScope.INDIVIDUAL,
        // unit: template?.unit || "",
        // defaultTarget: template?.defaultTarget || 0,
        // aggregation: template?.aggregation || TaskAggregation.COUNT,
        isActive: template?.isActive ?? true,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="title"
        label="Tiêu đề"
        rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
      >
        <Input placeholder="Nhập tiêu đề mẫu nhiệm vụ" />
      </Form.Item>

      <Form.Item name="description" label="Mô tả">
        <Input.TextArea rows={3} placeholder="Nhập mô tả chi tiết (tùy chọn)" />
      </Form.Item>
      <Form.Item
        name="level"
        label="Cấp độ"
        rules={[{ required: true, message: "Vui lòng chọn cấp độ" }]}
      >
        <Select options={LEVEL_OPTIONS_SELECT} placeholder="Chọn cấp độ" />
      </Form.Item>
      <Form.Item
        name="scope"
        label="Dành cho"
        rules={[{ required: true, message: "Vui lòng chọn" }]}
      >
        <Select options={scopeOptions} placeholder="Chọn phạm vi" />
      </Form.Item>

      {/* 
      <Form.Item name="unit" label="Đơn vị">
        <Input placeholder="VD: cái, kg, triệu đồng" />
      </Form.Item>

      <Form.Item name="defaultTarget" label="Mục tiêu">
        <InputNumber
          min={0}
          style={{ width: "100%" }}
          placeholder="Nhập mục tiêu"
        />
      </Form.Item>

      <Form.Item name="aggregation" label="Cách tính toán">
        <Select
          options={aggregationOptions}
          placeholder="Chọn cách tính toán"
        />
      </Form.Item> */}

      {isEditing && (
        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
        </Form.Item>
      )}

      <Form.Item>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {isEditing ? "Cập nhật" : "Tạo mới"}
          </Button>
          <Button onClick={onCancel}>Hủy</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
