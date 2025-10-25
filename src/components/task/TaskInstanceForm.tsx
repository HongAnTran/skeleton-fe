import React, { useEffect } from "react";
import { Form, Select, InputNumber, Button, Space } from "antd";
import {
  useCreateTaskInstance,
  useUpdateTaskInstance,
} from "../../queries/task.queries";
import { useTaskCycles } from "../../queries/task.queries";
import { useEmployees } from "../../queries/employee.queries";
import { useDepartments } from "../../queries/department.queries";
import type {
  TaskInstance,
  CreateTaskInstanceDto,
  UpdateTaskInstanceDto,
} from "../../types/task";
import { TaskScope } from "../../types/task";

interface TaskInstanceFormProps {
  instance?: TaskInstance;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TaskInstanceForm: React.FC<TaskInstanceFormProps> = ({
  instance,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!instance;

  const createMutation = useCreateTaskInstance();
  const updateMutation = useUpdateTaskInstance();
  const { data: cycles } = useTaskCycles({});
  const { data: employees } = useEmployees({});
  const { data: departments } = useDepartments({});

  const handleSubmit = async (
    values: CreateTaskInstanceDto | UpdateTaskInstanceDto
  ) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: instance!.id,
          data: values as UpdateTaskInstanceDto,
        });
      } else {
        await createMutation.mutateAsync(values as CreateTaskInstanceDto);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving instance:", error);
    }
  };

  const scopeOptions = [
    { label: "Cá nhân", value: TaskScope.INDIVIDUAL },
    { label: "Phòng ban", value: TaskScope.DEPARTMENT },
  ];

  const cycleOptions =
    cycles?.map((cycle) => ({
      label: `${cycle.periodStart} - ${cycle.periodEnd}`,
      value: cycle.id,
    })) || [];

  const employeeOptions =
    employees?.data?.map((employee: any) => ({
      label: employee.name,
      value: employee.id,
    })) || [];

  const departmentOptions =
    departments?.data?.map((department: any) => ({
      label: department.name,
      value: department.id,
    })) || [];

  const selectedScope = Form.useWatch("scope", form);

  useEffect(() => {
    if (isEditing && instance) {
      form.setFieldsValue({
        cycleId: instance.cycleId,
        scope: instance.scope,
        employeeId: instance.employeeId,
        departmentId: instance.departmentId,
        target: instance.target,
      });
    }
  }, [instance, form, isEditing]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        cycleId: instance?.cycleId || "",
        scope: instance?.scope || TaskScope.INDIVIDUAL,
        employeeId: instance?.employeeId || "",
        departmentId: instance?.departmentId || "",
        target: instance?.target || 0,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="cycleId"
        label="Chu kỳ"
        rules={[{ required: true, message: "Vui lòng chọn chu kỳ" }]}
      >
        <Select
          options={cycleOptions}
          placeholder="Chọn chu kỳ"
          disabled={isEditing}
        />
      </Form.Item>

      <Form.Item
        name="scope"
        label="Phạm vi"
        rules={[{ required: true, message: "Vui lòng chọn phạm vi" }]}
      >
        <Select
          options={scopeOptions}
          placeholder="Chọn phạm vi"
          disabled={isEditing}
        />
      </Form.Item>

      {selectedScope === TaskScope.INDIVIDUAL && (
        <Form.Item
          name="employeeId"
          label="Nhân viên"
          rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
        >
          <Select
            options={employeeOptions}
            placeholder="Chọn nhân viên"
            disabled={isEditing}
          />
        </Form.Item>
      )}

      {selectedScope === TaskScope.DEPARTMENT && (
        <Form.Item
          name="departmentId"
          label="Phòng ban"
          rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}
        >
          <Select
            options={departmentOptions}
            placeholder="Chọn phòng ban"
            disabled={isEditing}
          />
        </Form.Item>
      )}

      <Form.Item
        name="target"
        label="Mục tiêu"
        rules={[{ required: true, message: "Vui lòng nhập mục tiêu" }]}
      >
        <InputNumber
          min={0}
          style={{ width: "100%" }}
          placeholder="Nhập mục tiêu"
        />
      </Form.Item>

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
