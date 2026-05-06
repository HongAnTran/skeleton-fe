import { axiosInstance } from "@/lib/axios";
import type {
  CreateVoucherRuleBody,
  DeleteVoucherRuleResponse,
  PatchVoucherRuleBody,
  VoucherRule,
  VoucherRulesListParams,
} from "@/types/voucher-rule";

export class VoucherRuleService {
  static url = "/voucher-rules";

  static async list(params?: VoucherRulesListParams): Promise<VoucherRule[]> {
    const { data } = await axiosInstance.get<VoucherRule[]>(this.url, {
      params,
    });
    return data;
  }

  static async getById(id: string): Promise<VoucherRule> {
    const { data } = await axiosInstance.get<VoucherRule>(`${this.url}/${id}`);
    return data;
  }

  static async create(body: CreateVoucherRuleBody): Promise<VoucherRule> {
    const { data } = await axiosInstance.post<VoucherRule>(this.url, body);
    return data;
  }

  static async patch(id: string, body: PatchVoucherRuleBody): Promise<VoucherRule> {
    const { data } = await axiosInstance.patch<VoucherRule>(
      `${this.url}/${id}`,
      body,
    );
    return data;
  }

  static async remove(id: string): Promise<DeleteVoucherRuleResponse> {
    const { data } = await axiosInstance.delete<DeleteVoucherRuleResponse>(
      `${this.url}/${id}`,
    );
    return data;
  }
}
