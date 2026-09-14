import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Button, Card, Form, Input, message } from "antd";
import { useState } from "react";

const ADMIN_KEY =
  import.meta.env.VITE_ADMIN_KEY || "hitaothom-681fbad6780e855fb5bd905bffff69a1";
const STORAGE_KEY = "admin_access_key";

export const Route = createFileRoute("/admin")({
  component: AdminGate,
});

function AdminGate() {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem(STORAGE_KEY) === ADMIN_KEY,
  );

  if (unlocked) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
      <Card title="Khu vực quản trị" className="w-full max-w-sm">
        <Form
          onFinish={({ key }: { key: string }) => {
            if (key === ADMIN_KEY) {
              localStorage.setItem(STORAGE_KEY, key);
              setUnlocked(true);
            } else {
              message.error("Key không đúng");
            }
          }}
        >
          <Form.Item
            name="key"
            rules={[{ required: true, message: "Vui lòng nhập key" }]}
          >
            <Input.Password
              placeholder="Nhập key truy cập"
              autoFocus
              autoComplete="new-password"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Xác nhận
          </Button>
        </Form>
      </Card>
    </div>
  );
}
