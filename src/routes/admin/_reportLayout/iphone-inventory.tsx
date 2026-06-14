import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  Input,
  Select,
} from "antd";
import {
  MobileOutlined,
  ShopOutlined,
  FileExcelOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import { IphoneInventoryService } from "@/services/iphone-inventory.service";
import type {
  IphoneInventoryBranch,
  IphoneInventoryDetailRow,
  IphoneInventoryReport,
} from "@/types/iphone-inventory";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const MARKET_ALL = "__all__" as const;
const STORAGE_ALL = "__all__" as const;
type MarketFilter = typeof MARKET_ALL | "lock" | "international" | "unknown";

interface InventoryFilters {
  market: MarketFilter;
  model: string;
  storage: string;
}

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

/** Chuẩn hóa marketType backend (string) về union để so khớp filter. */
const normalizeMarket = (marketType: string): MarketFilter => {
  const t = marketType.toLowerCase();
  if (t === "lock") return "lock";
  if (t === "international") return "international";
  return "unknown";
};

const computeMarketTotals = (rows: IphoneInventoryDetailRow[]) =>
  rows.reduce(
    (acc, r) => {
      const kind = normalizeMarket(r.marketType);
      if (kind === "lock") acc.lockQuantity += r.onHand;
      else if (kind === "international") acc.internationalQuantity += r.onHand;
      else acc.unknownMarketQuantity += r.onHand;
      return acc;
    },
    { lockQuantity: 0, internationalQuantity: 0, unknownMarketQuantity: 0 },
  );

/**
 * Áp filter local lên detailRows của từng chi nhánh, rồi tính lại
 * totalOnHand / byMarket cho từng chi nhánh và toàn hệ thống để số liệu khớp
 * với những gì đang hiển thị. Chi nhánh không còn dòng nào sẽ bị loại.
 */
const applyFilters = (
  report: IphoneInventoryReport,
  filters: InventoryFilters,
): IphoneInventoryReport => {
  const model = filters.model.trim().toLowerCase();
  const branches = report.byBranch
    .map((branch) => {
      const detailRows = branch.detailRows.filter((r) => {
        if (
          filters.market !== MARKET_ALL &&
          normalizeMarket(r.marketType) !== filters.market
        )
          return false;
        if (filters.storage !== STORAGE_ALL && r.storage !== filters.storage)
          return false;
        if (model && !r.modelName.toLowerCase().includes(model)) return false;
        return true;
      });
      return {
        ...branch,
        detailRows,
        byMarket: computeMarketTotals(detailRows),
        totalOnHand: detailRows.reduce((s, r) => s + r.onHand, 0),
      };
    })
    .filter((branch) => branch.detailRows.length > 0);

  return {
    totalOnHand: branches.reduce((s, b) => s + b.totalOnHand, 0),
    byBranch: branches,
  };
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

interface ModelAgg {
  modelName: string;
  quantity: number;
  lockQuantity: number;
  internationalQuantity: number;
  unknownMarketQuantity: number;
}

/** Gộp tồn theo dòng máy, kèm tách Lock / QT / chưa rõ. Sắp theo tồn giảm dần. */
const aggregateByModel = (rows: IphoneInventoryDetailRow[]): ModelAgg[] => {
  const map = new Map<string, ModelAgg>();
  for (const r of rows) {
    const cur =
      map.get(r.modelName) ??
      {
        modelName: r.modelName,
        quantity: 0,
        lockQuantity: 0,
        internationalQuantity: 0,
        unknownMarketQuantity: 0,
      };
    cur.quantity += r.onHand;
    const kind = normalizeMarket(r.marketType);
    if (kind === "lock") cur.lockQuantity += r.onHand;
    else if (kind === "international") cur.internationalQuantity += r.onHand;
    else cur.unknownMarketQuantity += r.onHand;
    map.set(r.modelName, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity);
};

/** Gộp tồn theo một thuộc tính (dung lượng/màu). Sắp theo tồn giảm dần. */
const aggregateByKey = (
  rows: IphoneInventoryDetailRow[],
  key: "storage" | "color",
) => {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r[key], (map.get(r[key]) ?? 0) + r.onHand);
  return Array.from(map.entries())
    .map(([value, quantity]) => ({ value, quantity }))
    .sort((a, b) => b.quantity - a.quantity);
};

const byModelColumns = [
  { title: "Dòng máy", dataIndex: "modelName", key: "modelName", ellipsis: true },
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

const byStorageColumns = [
  { title: "Dung lượng", dataIndex: "value", key: "value" },
  {
    title: "Số lượng",
    dataIndex: "quantity",
    key: "quantity",
    width: 120,
    align: "right" as const,
  },
];

const byColorColumns = [
  { title: "Màu", dataIndex: "value", key: "value", ellipsis: true },
  {
    title: "Số lượng",
    dataIndex: "quantity",
    key: "quantity",
    width: 120,
    align: "right" as const,
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
  const byModel = aggregateByModel(branch.detailRows);
  const byStorage = aggregateByKey(branch.detailRows, "storage");
  const byColor = aggregateByKey(branch.detailRows, "color");

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

      <Title level={5} className="!mt-0 !mb-2">
        Theo dòng máy
      </Title>
      {byModel.length ? (
        <Table<ModelAgg>
          rowKey="modelName"
          dataSource={byModel}
          columns={byModelColumns}
          pagination={false}
          size="small"
          className="mb-6"
          scroll={{ x: 520 }}
        />
      ) : (
        <Empty
          className="mb-6"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không có dữ liệu theo dòng máy."
        />
      )}

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Title level={5} className="!mt-0 !mb-2">
            Theo dung lượng
          </Title>
          {byStorage.length ? (
            <Table
              rowKey="value"
              dataSource={byStorage}
              columns={byStorageColumns}
              pagination={false}
              size="small"
              scroll={{ x: 320 }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không có dữ liệu theo dung lượng."
            />
          )}
        </Col>
        <Col xs={24} md={12}>
          <Title level={5} className="!mt-0 !mb-2">
            Theo màu
          </Title>
          {byColor.length ? (
            <Table
              rowKey="value"
              dataSource={byColor}
              columns={byColorColumns}
              pagination={false}
              size="small"
              scroll={{ x: 320 }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không có dữ liệu theo màu."
            />
          )}
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

  const [filters, setFilters] = useState<InventoryFilters>({
    market: MARKET_ALL,
    model: "",
    storage: STORAGE_ALL,
  });

  // Tùy chọn dung lượng lấy từ toàn bộ dữ liệu gốc (không phụ thuộc filter).
  const storageOptions = useMemo(() => {
    const set = new Set<string>();
    data?.byBranch.forEach((b) =>
      b.detailRows.forEach((r) => r.storage && set.add(r.storage)),
    );
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, "vi", { numeric: true }),
    );
  }, [data]);

  const filtered = useMemo(
    () => (data ? applyFilters(data, filters) : undefined),
    [data, filters],
  );

  const branches = filtered?.byBranch ?? [];

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-sm mb-6">
          <Title level={4} className="!mb-4">
            <MobileOutlined className="mr-2" />
            Tồn kho iPhone theo chi nhánh
          </Title>
          <div className="flex flex-wrap gap-3 items-end">
            <Input
              allowClear
              placeholder="Tìm dòng máy (vd: 16 Pro Max)"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={filters.model}
              onChange={(e) =>
                setFilters((f) => ({ ...f, model: e.target.value }))
              }
              className="min-w-[240px] flex-1 lg:flex-none"
            />
            <Select<MarketFilter>
              value={filters.market}
              onChange={(v) => setFilters((f) => ({ ...f, market: v }))}
              className="min-w-[160px]"
              options={[
                { value: MARKET_ALL, label: "Tất cả thị trường" },
                { value: "lock", label: "Lock" },
                { value: "international", label: "Quốc tế" },
                { value: "unknown", label: "Chưa xác định" },
              ]}
            />
            <Select<string>
              value={filters.storage}
              onChange={(v) => setFilters((f) => ({ ...f, storage: v }))}
              className="min-w-[150px]"
              options={[
                { value: STORAGE_ALL, label: "Tất cả dung lượng" },
                ...storageOptions.map((s) => ({ value: s, label: s })),
              ]}
            />
          </div>
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
                    value={filtered?.totalOnHand ?? 0}
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
                  description={
                    data && data.byBranch.length > 0
                      ? "Không có máy nào khớp bộ lọc."
                      : "Không có chi nhánh nào còn tồn iPhone."
                  }
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
