import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  Table,
  Statistic,
  Row,
  Col,
  Alert,
  Spin,
  Empty,
  Tag,
  Tabs,
  Typography,
  Space,
  Button,
} from "antd";
import {
  MobileOutlined,
  ShopOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import { IphoneInventoryService } from "@/services/iphone-inventory.service";
import type {
  IphoneInventoryBranch,
  IphoneInventoryDetailRow,
} from "@/types/iphone-inventory";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export const Route = createFileRoute("/admin/_reportLayout/iphone-inventory")({
  component: IphoneInventoryReportPage,
});

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

const detailColumns = [
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
    title: "Tồn",
    dataIndex: "onHand",
    key: "onHand",
    width: 80,
    align: "right" as const,
    render: (v: number) => <Text strong>{v}</Text>,
  },
];

function exportBranchExcel(branch: IphoneInventoryBranch) {
  if (!branch.detailRows?.length) return;
  const rows = branch.detailRows.map((r) => ({
    "Dòng máy": r.modelName,
    "Dung lượng": r.storage,
    Màu: r.color,
    "Thị trường": formatMarketLabel(r.marketType),
    "Nhóm hàng": r.productGroup ?? "—",
    Tồn: r.onHand,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tồn iPhone");
  XLSX.writeFile(
    wb,
    `ton-iphone-${branch.branchName}-${dayjs().format("YYYY-MM-DD-HHmm")}.xlsx`,
  );
}

function BranchPanel({ branch }: { branch: IphoneInventoryBranch }) {
  return (
    <>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Statistic title="Tổng tồn" value={branch.totalOnHand} />
        </Col>
        <Col xs={24} sm={6}>
          <Statistic title="Lock" value={branch.byMarket.lockQuantity} />
        </Col>
        <Col xs={24} sm={6}>
          <Statistic
            title="Quốc tế"
            value={branch.byMarket.internationalQuantity}
          />
        </Col>
        <Col xs={24} sm={6}>
          <Statistic
            title="Chưa xác định"
            value={branch.byMarket.unknownMarketQuantity}
          />
        </Col>
      </Row>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <Title level={5} className="!mb-0">
          Chi tiết cấu hình + thị trường
        </Title>
        {branch.detailRows?.length ? (
          <Button
            icon={<FileExcelOutlined />}
            size="small"
            onClick={() => exportBranchExcel(branch)}
          >
            Xuất Excel
          </Button>
        ) : null}
      </div>
      {branch.detailRows?.length ? (
        <Table<IphoneInventoryDetailRow>
          rowKey={(_, i) => String(i)}
          dataSource={branch.detailRows}
          columns={detailColumns}
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
  );
}

function IphoneInventoryReportPage() {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["kiotviet-iphone-inventory"],
    queryFn: () => IphoneInventoryService.getReport(),
    staleTime: 60 * 3 * 1000, // 3 minutes
  });

  const branches = data?.byBranch ?? [];

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-sm mb-6">
          <Title level={4} className="!mb-0">
            <MobileOutlined className="mr-2" />
            Tồn kho iPhone theo chi nhánh
          </Title>
        </Card>

        {error && (
          <Alert
            message="Không thể tải dữ liệu"
            description="Kiểm tra kết nối KiotViet hoặc thử lại sau."
            type="error"
            showIcon
            className="mb-6"
            closable
          />
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <Spin size="large" tip="Đang tải tồn kho..." />
          </div>
        )}

        {!isLoading && data && (
          <>
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <MobileOutlined />
                        <span>Tổng tồn iPhone (toàn hệ thống)</span>
                      </Space>
                    }
                    value={data.totalOnHand}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <ShopOutlined />
                        <span>Số chi nhánh có tồn</span>
                      </Space>
                    }
                    value={branches.length}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title={
                <Space>
                  <ShopOutlined />
                  <span>Chi tiết theo chi nhánh</span>
                </Space>
              }
              className="shadow-sm"
            >
              {branches.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có chi nhánh nào còn tồn iPhone."
                />
              ) : (
                <Tabs
                  items={branches.map((b) => ({
                    key: String(b.branchId),
                    label: (
                      <Space size={4}>
                        <span>{b.branchName}</span>
                        <Tag color="purple">{b.totalOnHand}</Tag>
                      </Space>
                    ),
                    children: <BranchPanel branch={b} />,
                  }))}
                />
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
