import { useEffect } from "react";
import { Form, Input, Button, Space, Switch, Select, InputNumber } from "antd";
import { useDepartments } from "../../queries/department.queries";
import type { Task, CreateTaskDto, UpdateTaskDto } from "../../types/task";
import { LEVEL_OPTIONS_SELECT } from "../../consts/task";

interface TaskTemplateFormProps {
  task?: Task | null;
  onSubmit: (values: CreateTaskDto | UpdateTaskDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function TaskTemplateForm({
  task,
  onSubmit,
  onCancel,
  loading = false,
}: TaskTemplateFormProps) {
  const [form] = Form.useForm();
  const isEditing = !!task;

  // Get departments for select
  const { data: departments } = useDepartments({
    page: 1,
    limit: 100,
  });

  const handleSubmit = async (values: any) => {
    await onSubmit(values);
    if (!isEditing) {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  useEffect(() => {
    if (task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        departmentId: task.departmentId,
        level: task.level,
        isTaskTeam: task.isTaskTeam,
      });
    } else {
      form.resetFields();
    }
  }, [task, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        level: 1,
        required: true,
        isActive: true,
        isTaskTeam: false,
      }}
    >
      <Form.Item
        label="Tên task"
        name="title"
        rules={[
          { required: true, message: "Vui lòng nhập tên task!" },
          { min: 3, message: "Tên task phải có ít nhất 3 ký tự!" },
        ]}
      >
        <Input placeholder="VD: Hoàn thành KPI bán hàng tháng 11" />
      </Form.Item>

      <Form.Item label="Mô tả" name="description">
        <Input.TextArea
          rows={4}
          placeholder="Mô tả chi tiết về task, yêu cầu cần đạt được..."
        />
      </Form.Item>

      <Form.Item
        label="Phòng ban"
        name="departmentId"
        rules={[{ required: true, message: "Vui lòng chọn phòng ban!" }]}
      >
        <Select
          placeholder="Chọn phòng ban"
          loading={!departments}
          showSearch
          optionFilterProp="children"
        >
          {departments?.data.map((dept) => (
            <Select.Option key={dept.id} value={dept.id}>
              {dept.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          label="Cấp độ nhiệm vụ"
          name="level"
          rules={[{ required: true, message: "Vui lòng chọn mức độ!" }]}
        >
          <Select
            placeholder="Chọn cấp độ nhiệm vụ"
            options={LEVEL_OPTIONS_SELECT}
          />
        </Form.Item>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          label="Task nhóm"
          name="isTaskTeam"
          valuePropName="checked"
          tooltip="Task nhóm: toàn phòng cùng làm một task"
        >
          <Switch checkedChildren="Nhóm" unCheckedChildren="Cá nhân" />
        </Form.Item>
      </div>

      <Form.Item className="mb-0">
        <Space className="w-full justify-end">
          <Button onClick={handleCancel} disabled={loading}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditing ? "Cập nhật Task" : "Tạo Task"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
