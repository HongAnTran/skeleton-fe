import { useEffect, useState } from "react";
import { Form, Button, Space, Select, Radio, Checkbox, Alert } from "antd";
import { useEmployees } from "../../queries/employee.queries";
import type { TaskCycle, AssignEmployeesToCycleDto } from "../../types/task";

interface TaskAssignmentFormProps {
  cycle: TaskCycle | null;
  onSubmit: (values: AssignEmployeesToCycleDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function TaskAssignmentForm({
  cycle,
  onSubmit,
  onCancel,
  loading = false,
}: TaskAssignmentFormProps) {
  const [form] = Form.useForm();
  const [assignType, setAssignType] = useState<"all" | "specific">("all");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Get employees from the task's department
  const departmentId = cycle?.task?.departmentId;
  const { data: employeesData } = useEmployees(
    {
      page: 1,
      limit: 100,
      departmentId: departmentId,
    },
    {
      enabled: !!departmentId && assignType === "specific",
    }
  );

  const handleSubmit = async () => {
    const data: AssignEmployeesToCycleDto = {
      cycleId: cycle?.id || "",
      ...(assignType === "all"
        ? { departmentId }
        : { employeeIds: selectedEmployees }),
    };
    await onSubmit(data);
    handleCancel();
  };

  const handleCancel = () => {
    form.resetFields();
    setAssignType("all");
    setSelectedEmployees([]);
    onCancel();
  };

  useEffect(() => {
    if (cycle) {
      setAssignType("all");
      setSelectedEmployees([]);
    }
  }, [cycle]);

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      {cycle && (
        <Alert
          message={
            <div>
              <div className="font-medium">{cycle.task?.title}</div>
              <div className="text-sm text-gray-600">
                {cycle.task?.department?.name}
              </div>
            </div>
          }
          type="info"
          className="mb-4"
        />
      )}

      <Form.Item label="Phương thức gán">
        <Radio.Group
          value={assignType}
          onChange={(e) => setAssignType(e.target.value)}
        >
          <Space direction="vertical">
            <Radio value="all">
              <span className="font-medium">Gán toàn bộ phòng ban</span>
              <div className="text-gray-500 text-sm ml-6">
                Tất cả nhân viên trong phòng sẽ được gán task này
              </div>
            </Radio>
            <Radio value="specific">
              <span className="font-medium">Chọn nhân viên cụ thể</span>
              <div className="text-gray-500 text-sm ml-6">
                Chỉ gán cho một số nhân viên được chọn
              </div>
            </Radio>
          </Space>
        </Radio.Group>
      </Form.Item>

      {assignType === "specific" && (
        <Form.Item
          label="Chọn nhân viên"
          rules={[
            {
              validator: () =>
                selectedEmployees.length > 0
                  ? Promise.resolve()
                  : Promise.reject("Vui lòng chọn ít nhất 1 nhân viên!"),
            },
          ]}
        >
          <div className="border rounded p-3 max-h-64 overflow-y-auto">
            <Checkbox
              className="mb-2"
              checked={
                selectedEmployees.length ===
                  (employeesData?.data.length || 0) &&
                selectedEmployees.length > 0
              }
              indeterminate={
                selectedEmployees.length > 0 &&
                selectedEmployees.length < (employeesData?.data.length || 0)
              }
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedEmployees(
                    employeesData?.data.map((emp) => emp.id) || []
                  );
                } else {
                  setSelectedEmployees([]);
                }
              }}
            >
              <span className="font-medium">Chọn tất cả</span>
            </Checkbox>

            <div className="space-y-2">
              {employeesData?.data.map((employee) => (
                <div key={employee.id}>
                  <Checkbox
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmployees([
                          ...selectedEmployees,
                          employee.id,
                        ]);
                      } else {
                        setSelectedEmployees(
                          selectedEmployees.filter((id) => id !== employee.id)
                        );
                      }
                    }}
                  >
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      {employee.account?.email && (
                        <div className="text-xs text-gray-500">
                          {employee.account.email}
                        </div>
                      )}
                    </div>
                  </Checkbox>
                </div>
              ))}
            </div>

            {employeesData?.data.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                Không có nhân viên nào trong phòng ban này
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Đã chọn: {selectedEmployees.length} nhân viên
          </div>
        </Form.Item>
      )}

      <Form.Item className="mb-0">
        <Space className="w-full justify-end">
          <Button onClick={handleCancel} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={
              assignType === "specific" && selectedEmployees.length === 0
            }
          >
            Gán Nhân Viên
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
