import { ConfigProvider } from "antd";
import locale from "antd/locale/vi_VN";
import dayjs from "dayjs";

import "dayjs/locale/vi";

dayjs.locale("vi");

export default function LocaleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConfigProvider locale={locale}>{children}</ConfigProvider>;
}
