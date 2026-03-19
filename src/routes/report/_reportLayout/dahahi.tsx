import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Form, Select, DatePicker, Button, Spin, Typography } from "antd";
import { TeamOutlined, UserOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { DahahiService } from "@/services/dahahi.service";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Title } = Typography;

export const Route = createFileRoute("/report/_reportLayout/dahahi")({
  component: DahahiReportPage,
});

function DahahiReportPage() {
  const [form] = Form.useForm();
  const [userId, setUserId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<[string, string] | null>([
    dayjs().startOf("day").toISOString(),
    dayjs().endOf("day").toISOString(),
  ]);

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ["dahahi-employees"],
    queryFn: () => DahahiService.getEmployees(),
    staleTime: Infinity,
  });

  const formatDate = (dateString: string) =>
    dayjs(dateString).format("DD/MM/YYYY HH:mm");
  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-sm mb-6">
          <Title level={4} className="!mb-4">
            <TeamOutlined className="mr-2" />
            Báo cáo chấm công
          </Title>
          <Form
            form={form}
            initialValues={{ dateRange: [dayjs(), dayjs()] }}
            layout="inline"
            className="flex flex-wrap gap-3 items-end"
          >
            <Form.Item
              name="employeeCode"
              rules={[{ required: true, message: "Chọn nhân viên" }]}
              className="!mb-0 lg:min-w-[320px] min-w-[300px]"
            >
              <Select
                placeholder="Tìm theo tên — chọn nhân viên Dahahi"
                loading={loadingEmployees}
                showSearch
                filterOption={false}
                options={employees.map((e) => ({
                  value: e.EmployeeCode,
                  label: e.Name,
                }))}
                suffixIcon={<UserOutlined className="text-gray-400" />}
                allowClear
                notFoundContent={
                  loadingEmployees ? <Spin size="small" /> : undefined
                }
              />
            </Form.Item>
            <Form.Item name="dateRange" className="!mb-0">
              <RangePicker
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
                className="w-full"
              />
            </Form.Item>
            <Form.Item className="!mb-0 w-full lg:w-auto">
              <Button
                className="w-full lg:w-auto"
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                loading={loadingEmployees && !!userId}
              >
                Xem báo cáo
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
