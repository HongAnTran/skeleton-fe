import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Spin,
  Typography,
  Table,
  Statistic,
  Row,
  Col,
  Space,
  Empty,
  Image,
  Tag,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { DahahiService } from "@/services/dahahi.service";
import type { DahahiCheckinRecord } from "@/types/dahahi";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export const Route = createFileRoute("/report/dahahi")({
  component: DahahiReportPage,
});

function DahahiReportPage() {
  const [form] = Form.useForm();
  const [employeeCode, setEmployeeCode] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    [dayjs(), dayjs()],
  );

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ["dahahi-employees"],
    queryFn: () => DahahiService.getEmployees(),
    staleTime: Infinity,
  });

  const {
    data: checkinData,
    isLoading: loadingCheckin,
    isFetching: fetchingCheckin,
  } = useQuery({
    queryKey: ["dahahi-checkinhis", employeeCode, dateRange],
    queryFn: () =>
      DahahiService.getCheckinHistory({
        EmployeeCode: employeeCode!,
        FromTimeStr: dateRange![0].format("DD/MM/YYYY 00:00:00"),
        ToTimeStr: dateRange![1].format("DD/MM/YYYY 23:59:59"),
      }),
    enabled: !!employeeCode && !!dateRange,
  });

  const handleSearch = (values: {
    employeeCode: string;
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
  }) => {
    setEmployeeCode(values.employeeCode);
    setDateRange(values.dateRange ?? [dayjs(), dayjs()]);
  };

  const records: DahahiCheckinRecord[] = checkinData?.data ?? [];
  const report = checkinData?.report;

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "CheckinTime1Str",
      key: "CheckinTime1Str",
      width: 160,
      render: (v: string) => (
        <Space>
          <ClockCircleOutlined className="text-gray-400" />
          <Text>{v}</Text>
        </Space>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "EmployeeName",
      key: "EmployeeName",
      ellipsis: true,
      render: (v: string) => (
        <Space>
          <UserOutlined className="text-gray-400" />
          {v}
        </Space>
      ),
    },
    {
      title: "Mã NV",
      dataIndex: "EmployeeCode",
      key: "EmployeeCode",
      width: 120,
    },
    {
      title: "Ảnh chấm công",
      dataIndex: "LiveImageUrl",
      key: "LiveImageUrl",
      width: 140,
      render: (url: string) =>
        url ? (
          <Image
            src={url}
            alt="checkin"
            width={64}
            height={64}
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

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
            onFinish={handleSearch}
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
                loading={fetchingCheckin && !!employeeCode}
              >
                Xem báo cáo
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {loadingCheckin && employeeCode && (
          <div className="flex justify-center py-12">
            <Spin size="large" tip="Đang tải lịch sử chấm công..." />
          </div>
        )}

        {!loadingCheckin && employeeCode && checkinData && (
          <>
            <Row gutter={[16, 16]} className="mb-6 mt-6">
              <Col xs={24} sm={12}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <CalendarOutlined />
                        <span>Tổng giờ làm</span>
                      </Space>
                    }
                    value={report?.totalWorkHours ?? 0}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <ClockCircleOutlined />
                        <span>Tổng lượt chấm công</span>
                      </Space>
                    }
                    value={report?.totalRecords ?? 0}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title={
                <Space>
                  <FileImageOutlined />
                  <span>Lịch sử chấm công</span>
                  <Tag color="blue">{records.length} bản ghi</Tag>
                </Space>
              }
              className="shadow-sm"
            >
              {records.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có bản ghi chấm công trong khoảng thời gian đã chọn."
                />
              ) : (
                <Table
                  rowKey={(r, i) =>
                    `${r.EmployeeIdStr}-${r.CheckinTime1Str}-${i}`
                  }
                  dataSource={records}
                  columns={columns}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (t) => `Tổng ${t} bản ghi`,
                  }}
                  size="middle"
                />
              )}
            </Card>
          </>
        )}

        {!employeeCode && !loadingCheckin && (
          <Card className="shadow-sm">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chọn nhân viên và bấm «Xem báo cáo» để xem lịch sử chấm công."
            />
          </Card>
        )}
      </div>
    </div>
  );
}
