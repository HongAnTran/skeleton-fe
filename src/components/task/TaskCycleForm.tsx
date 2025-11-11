import { useEffect } from "react";
import { Form, DatePicker, Button, Space, Select } from "antd";
import dayjs from "dayjs";
import type {
  Task,
  CreateTaskCycleDto,
  CreateTaskCycleAllDto,
} from "../../types/task";

const { RangePicker } = DatePicker;

interface TaskCycleFormProps {
  task?: Task | null;
  tasks?: Task[];
  onSubmit: (
    values: CreateTaskCycleDto | CreateTaskCycleAllDto
  ) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  type?: "single" | "all";
}

export function TaskCycleForm({
  task,
  tasks = [],
  onSubmit,
  onCancel,
  loading = false,
  type = "single",
}: TaskCycleFormProps) {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    const [periodStart, periodEnd] = values.period;

    if (type === "single") {
      const data: CreateTaskCycleDto = {
        taskId: values.taskId || task?.id || "",
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      };
      await onSubmit(data);
    } else {
      const data: CreateTaskCycleAllDto = {
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      };
      await onSubmit(data);
    }
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  useEffect(() => {
    if (task && type === "single") {
      form.setFieldsValue({
        taskId: task.id,
      });
    }
  }, [task, form, type]);

  useEffect(() => {
    if (type === "all") {
      form.setFieldsValue({
        period: [
          dayjs().startOf("month").add(1, "month").startOf("day"),
          dayjs().endOf("month").add(1, "month").startOf("day"),
        ],
      });
    }
  }, [type, form, dayjs]);

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      {type === "single" && (
        <Form.Item
          label="Task"
          name="taskId"
          rules={[{ required: true, message: "Vui lòng chọn task!" }]}
        >
          <Select
            placeholder="Chọn task"
            disabled={!!task}
            showSearch
            optionFilterProp="children"
          >
            {(task ? [task] : tasks).map((t) => (
              <Select.Option key={t.id} value={t.id}>
                {t.title} - {t.department?.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
      <Form.Item
        label="Chu kỳ thực hiện"
        name="period"
        rules={[{ required: true, message: "Vui lòng chọn chu kỳ!" }]}
      >
        <RangePicker
          className="w-full"
          format="DD/MM/YYYY"
          placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
          disabledDate={(current) => {
            // Không cho chọn ngày quá khứ
            return current && current < dayjs().startOf("day");
          }}
        />
      </Form.Item>

      <Form.Item className="mb-0">
        <Space className="w-full justify-end">
          <Button onClick={handleCancel} disabled={loading}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Tạo Chu Kỳ
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
