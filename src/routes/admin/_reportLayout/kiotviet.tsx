import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Table,
  Statistic,
  Row,
  Col,
  Alert,
  Spin,
  Empty,
  Tag,
  Typography,
  Space,
} from "antd";
import {
  TeamOutlined,
  FileTextOutlined,
  FileExcelOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  UserOutlined,
  SearchOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import { KiotVietService } from "@/services/kiotviet.service";
import type {
  KiotVietUser,
  Invoice,
  InvoicesByUserReport,
  IphoneDetailRow,
} from "@/types/kiotviet";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

/** Giá trị Select khi báo cáo tổng — không gửi userId lên API */
const INVOICES_REPORT_STORE_TOTAL = "__store_total__" as const;
type InvoicesReportSubject =
  | number
  | typeof INVOICES_REPORT_STORE_TOTAL
  | null;

export const Route = createFileRoute("/admin/_reportLayout/kiotviet")({
  component: KiotVietReportPage,
});

function KiotVietReportPage() {
  const [form] = Form.useForm();
  const [reportSubject, setReportSubject] =
    useState<InvoicesReportSubject>(null);
  const [dateRange, setDateRange] = useState<[string, string] | null>([
    dayjs().startOf("day").toISOString(),
    dayjs().endOf("day").toISOString(),
  ]);

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ["kiotviet-users"],
    queryFn: () =>
      KiotVietService.getUsers({
        pageSize: 100,
        orderBy: "givenName",
        orderDirection: "Asc",
      }),
    staleTime: Infinity,
  });

  const {
    data: invoicesData,
    isLoading: loadingInvoices,
    isFetching: fetchingInvoices,
    error: invoicesError,
  } = useQuery({
    queryKey: ["kiotviet-invoices-by-user", reportSubject, dateRange],
    queryFn: () =>
      KiotVietService.getInvoicesByUser({
        ...(reportSubject !== INVOICES_REPORT_STORE_TOTAL &&
          reportSubject != null && { userId: reportSubject }),
        ...(dateRange?.[0] && { fromPurchaseDate: dateRange[0] }),
        ...(dateRange?.[1] && { toPurchaseDate: dateRange[1] }),
      }),
    enabled: reportSubject != null,
    staleTime: 60 * 3 * 1000, // 3 minutes
  });

  const users: KiotVietUser[] = usersData?.data ?? [];
  const report: InvoicesByUserReport | undefined = invoicesData?.report;
  const invoices: Invoice[] = invoicesData?.data ?? [];

  const handleSearch = (values: {
    userId: number | typeof INVOICES_REPORT_STORE_TOTAL;
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
  }) => {
    setReportSubject(values.userId);
    setDateRange(
      values.dateRange
        ? [
          values.dateRange[0].startOf("day").toISOString(),
          values.dateRange[1].endOf("day").toISOString(),
        ]
        : null,
    );
  };

  const formatDate = (dateString: string) =>
    dayjs(dateString).format("DD/MM/YYYY HH:mm");
  const formatMoney = (n: number) => {
    const amount = n * 1000;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const columns = [
    {
      title: "Mã HĐ",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (code: string) => (
        <Space>
          <FileTextOutlined className="text-gray-400" />
          <Text strong>{code}</Text>
        </Space>
      ),
    },
    {
      title: "Ngày bán",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 150,
      render: (v: string) => (
        <Space>
          <CalendarOutlined className="text-gray-400" />
          {formatDate(v)}
        </Space>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "soldByName",
      key: "soldByName",
      width: 160,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      ellipsis: true,
      render: (v: string) => (
        <Space>
          <UserOutlined className="text-gray-400" />
          {v}
        </Space>
      ),
    },
    {
      title: "số lượng",
      dataIndex: "invoiceDetails",
      key: "invoiceDetails",
      width: 140,
      align: "right" as const,
      render: (v: any[]) => <Text strong>{v.length}</Text>,
    },
    {
      title: "Tổng thanh toán",
      dataIndex: "totalPayment",
      key: "totalPayment",
      width: 140,
      align: "right" as const,
      render: (v: number) => <Text strong>{formatMoney(v)}</Text>,
    },
    {
      title: "Bảo hành",
      key: "warranty",
      width: 110,
      render: (_: unknown, record: Invoice) =>
        record.warranty ? (
          <Tag
            icon={<SafetyCertificateOutlined />}
            color={
              record.warranty.status === "Còn hiệu lực" ? "green" : "default"
            }
          >
            {record.warranty.status}
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  const warrantyBreakdownColumns = [
    {
      title: "Gói bảo hành",
      dataIndex: "warrantyType",
      key: "warrantyType",
      ellipsis: true,
      render: (v: string) => (
        <Space>
          <SafetyCertificateOutlined className="text-gray-400" />
          <Text strong>{v}</Text>
        </Space>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 110,
      align: "right" as const,
    },
    {
      title: "Số đơn",
      dataIndex: "orderCount",
      key: "orderCount",
      width: 100,
      align: "right" as const,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      width: 170,
      align: "right" as const,
      render: (v: number) => <Text strong>{formatMoney(v)}</Text>,
    },
  ];

  const iphone = report?.iphoneReport;

  const formatMarketLabel = (marketType: string) => {
    const t = marketType.toLowerCase();
    if (t === "lock") return "Lock";
    if (t === "international") return "Quốc tế";
    return "—";
  };

  const renderMarketTag = (marketType: string) => {
    const label = formatMarketLabel(marketType);
    if (label === "Lock") return <Tag>Lock</Tag>;
    if (label === "Quốc tế") return <Tag color="blue">Quốc tế</Tag>;
    return <Text type="secondary">—</Text>;
  };

  const iphoneByModelColumns = [
    {
      title: "Dòng máy",
      dataIndex: "modelName",
      key: "modelName",
      ellipsis: true,
    },
    {
      title: "Tổng",
      dataIndex: "quantity",
      key: "quantity",
      width: 90,
      align: "right" as const,
    },
    {
      title: "Lock",
      dataIndex: "lockQuantity",
      key: "lockQuantity",
      width: 90,
      align: "right" as const,
    },
    {
      title: "QT",
      dataIndex: "internationalQuantity",
      key: "internationalQuantity",
      width: 90,
      align: "right" as const,
    },
    {
      title: "Chưa rõ",
      dataIndex: "unknownMarketQuantity",
      key: "unknownMarketQuantity",
      width: 100,
      align: "right" as const,
    },
  ];

  const iphoneByStorageColumns = [
    {
      title: "Dung lượng",
      dataIndex: "storage",
      key: "storage",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      align: "right" as const,
    },
  ];

  const iphoneByColorColumns = [
    {
      title: "Màu",
      dataIndex: "color",
      key: "color",
      ellipsis: true,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      align: "right" as const,
    },
  ];

  const iphoneDetailColumns = [
    {
      title: "Dòng máy",
      dataIndex: "modelName",
      key: "modelName",
      ellipsis: true,
    },
    {
      title: "Dung lượng",
      dataIndex: "storage",
      key: "storage",
      width: 110,
    },
    {
      title: "Màu",
      dataIndex: "color",
      key: "color",
      ellipsis: true,
    },
    {
      title: "Thị trường",
      dataIndex: "marketType",
      key: "marketType",
      width: 120,
      render: (v: string) => renderMarketTag(v),
    },
    {
      title: "Nhóm hàng",
      dataIndex: "productGroup",
      key: "productGroup",
      width: 120,
      ellipsis: true,
      render: (v: string | undefined) =>
        v ? <Text>{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      align: "right" as const,
    },
  ];

  const exportIphoneDetailExcel = () => {
    const detailRows = iphone?.detailRows;
    if (!detailRows?.length) return;
    const rows = detailRows.map((r) => ({
      "Dòng máy": r.modelName,
      "Dung lượng": r.storage,
      Màu: r.color,
      "Thị trường": formatMarketLabel(r.marketType),
      "Nhóm hàng": r.productGroup ?? "—",
      SL: r.quantity,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Chi tiết iPhone");
    XLSX.writeFile(
      wb,
      `kiotviet-iphone-chi-tiet-${dayjs().format("YYYY-MM-DD-HHmm")}.xlsx`,
    );
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-sm mb-6">
          <Title level={4} className="!mb-4">
            <TeamOutlined className="mr-2" />
            Báo cáo hóa đơn
          </Title>
          <Form
            form={form}
            initialValues={{ dateRange: [dayjs(), dayjs()] }}
            onFinish={handleSearch}
            layout="inline"
            className="flex flex-wrap gap-3 items-end"
          >
            <Form.Item
              name="userId"
              rules={[
                { required: true, message: "Chọn phạm vi báo cáo hoặc nhân viên" },
              ]}
              className="!mb-0 lg:min-w-[320px] min-w-[300px]"
            >
              <Select
                placeholder="Nhân viên hoặc tổng cửa hàng"
                loading={loadingUsers}
                showSearch
                optionFilterProp="label"
                options={[
                  {
                    value: INVOICES_REPORT_STORE_TOTAL,
                    label: "Tổng cửa hàng (toàn bộ)",
                  },
                  ...users.map((u) => ({
                    value: u.id,
                    label: `${u.givenName} (${u.userName})`,
                  })),
                ]}
                suffixIcon={<UserOutlined className="text-gray-400" />}
                allowClear
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
                loading={fetchingInvoices && reportSubject != null}
              >
                Xem báo cáo
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {invoicesError && (
          <Alert
            message="Không thể tải dữ liệu"
            description="Kiểm tra kết nối KiotViet hoặc thử lại sau."
            type="error"
            showIcon
            className="mb-6"
            closable
          />
        )}

        {loadingInvoices && reportSubject != null && (
          <div className="flex justify-center py-12">
            <Spin size="large" tip="Đang tải hóa đơn..." />
          </div>
        )}

        {!loadingInvoices && reportSubject != null && invoicesData && (
          <>
            <Row gutter={[16, 16]} className="mb-6 mt-6">
              <Col xs={24} sm={12} md={8}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <FileTextOutlined />
                        <span>Tổng số máy (IMEI)</span>
                      </Space>
                    }
                    value={report?.totalOrders ?? 0}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <DollarOutlined />
                        <span>Doanh thu</span>
                      </Space>
                    }
                    value={report?.revenue ?? 0}
                    formatter={(v) => formatMoney(Number(v))}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <SafetyCertificateOutlined />
                        <span>Đơn có bảo hành</span>
                      </Space>
                    }
                    value={report?.warrantyOrderCount ?? 0}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <DollarOutlined />
                        <span>Doanh thu phụ kiện</span>
                      </Space>
                    }
                    value={report?.accessoryRevenue ?? 0}
                    formatter={(v) => formatMoney(Number(v))}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <SafetyCertificateOutlined />
                        <span>Doanh thu bảo hành</span>
                      </Space>
                    }
                    value={report?.warrantyRevenue ?? 0}
                    formatter={(v) => formatMoney(Number(v))}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <SafetyCertificateOutlined />
                        <span>SL gói bảo hành</span>
                      </Space>
                    }
                    value={report?.warrantyQuantity ?? 0}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <SafetyCertificateOutlined />
                        <span>SL đổi trả</span>
                      </Space>
                    }
                    value={report?.exchangeInvoiceCount ?? 0}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title={
                <Space>
                  <SafetyCertificateOutlined />
                  <span>Chi tiết gói bảo hành</span>
                  <Tag color="green">
                    {report?.warrantyBreakdown?.length ?? 0} loại
                  </Tag>
                </Space>
              }
              className="shadow-sm mb-6"
            >
              {report?.warrantyBreakdown?.length ? (
                <Table
                  rowKey={(r) => r.warrantyType}
                  dataSource={report.warrantyBreakdown}
                  columns={warrantyBreakdownColumns}
                  pagination={false}
                  size="small"
                  scroll={{ x: 650 }}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có gói bảo hành trong các hóa đơn đã lọc."
                />
              )}
            </Card>

            <Card
              title={
                <Space>
                  <MobileOutlined />
                  <span>Báo cáo iPhone (IMEI)</span>
                  {iphone != null && iphone.totalIphoneUnits > 0 && (
                    <Tag color="purple">{iphone.totalIphoneUnits} máy</Tag>
                  )}
                </Space>
              }
              className="shadow-sm mb-6"
            >
              {!iphone ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có dữ liệu iphoneReport từ API."
                />
              ) : iphone.totalIphoneUnits === 0 &&
                !iphone.byModel?.length &&
                !iphone.detailRows?.length ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có máy iPhone (IMEI) trong kỳ đã chọn."
                />
              ) : (
                <>
                  <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="Lock"
                        value={iphone.byMarket?.lockQuantity ?? 0}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="Quốc tế"
                        value={iphone.byMarket?.internationalQuantity ?? 0}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="Chưa xác định"
                        value={iphone.byMarket?.unknownMarketQuantity ?? 0}
                      />
                    </Col>
                  </Row>

                  <Title level={5} className="!mt-0 !mb-2">
                    Theo dòng máy
                  </Title>
                  {iphone.byModel?.length ? (
                    <Table
                      rowKey={(r) => r.modelName}
                      dataSource={iphone.byModel}
                      columns={iphoneByModelColumns}
                      pagination={false}
                      size="small"
                      className="mb-6"
                      scroll={{ x: 520 }}
                    />
                  ) : (
                    <Empty
                      className="mb-6"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Không có phân tích theo dòng máy."
                    />
                  )}

                  <Title level={5} className="!mb-2">
                    Theo dung lượng
                  </Title>
                  {iphone.byStorage?.length ? (
                    <Table
                      rowKey={(r) => r.storage}
                      dataSource={iphone.byStorage}
                      columns={iphoneByStorageColumns}
                      pagination={false}
                      size="small"
                      className="mb-6"
                      scroll={{ x: 320 }}
                    />
                  ) : (
                    <Empty
                      className="mb-6"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Không có phân tích theo dung lượng."
                    />
                  )}

                  <Title level={5} className="!mb-2">
                    Theo màu
                  </Title>
                  {iphone.byColor?.length ? (
                    <Table
                      rowKey={(r) => r.color}
                      dataSource={iphone.byColor}
                      columns={iphoneByColorColumns}
                      pagination={false}
                      size="small"
                      className="mb-6"
                      scroll={{ x: 320 }}
                    />
                  ) : (
                    <Empty
                      className="mb-6"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Không có phân tích theo màu."
                    />
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <Title level={5} className="!mb-0">
                      Chi tiết cấu hình + thị trường
                    </Title>
                    {iphone.detailRows?.length ? (
                      <Button
                        icon={<FileExcelOutlined />}
                        size="small"
                        onClick={exportIphoneDetailExcel}
                      >
                        Xuất Excel
                      </Button>
                    ) : null}
                  </div>
                  {iphone.detailRows?.length ? (
                    <Table<IphoneDetailRow>
                      rowKey={(_, i) => String(i)}
                      dataSource={iphone.detailRows}
                      columns={iphoneDetailColumns}
                      pagination={{
                        pageSize: 15,
                        showSizeChanger: true,
                        showTotal: (t) => `Tổng ${t} dòng`,
                      }}
                      size="small"
                      scroll={{ x: 800 }}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Không có dòng chi tiết."
                    />
                  )}
                </>
              )}
            </Card>

            <Card
              title={
                <Space>
                  <FileTextOutlined />
                  <span>Danh sách hóa đơn</span>
                  <Tag color="blue">{invoices.length} đơn</Tag>
                </Space>
              }

              className="shadow-sm"
            >
              {invoices.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có hóa đơn trong khoảng thời gian đã chọn."
                />
              ) : (
                <Table
                  rowKey="id"
                  dataSource={invoices}
                  columns={columns}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (t) => `Tổng ${t} đơn`,
                  }}
                  size="middle"
                  scroll={{ x: 700 }}
                />
              )}
            </Card>
          </>
        )}

        {!reportSubject && !loadingInvoices && (
          <Card className="shadow-sm">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chọn nhân viên hoặc «Tổng cửa hàng», rồi bấm «Xem báo cáo»."
            />
          </Card>
        )}
      </div>
    </div>
  );
}
