export type VoucherRuleConditionType =
  | "INVOICE_COUNT_TIER"
  | "WARRANTY_ACTIVE";

export interface VoucherRule {
  id: string;
  name: string;
  conditionType: VoucherRuleConditionType;
  conditionValue: string;
  discountVnd: number;
  flags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherRulesListParams {
  conditionType?: VoucherRuleConditionType;
  isActive?: boolean;
}

export interface CreateVoucherRuleBody {
  name: string;
  conditionType: VoucherRuleConditionType;
  conditionValue: string;
  discountVnd: number;
  flags?: string[];
  isActive?: boolean;
}

export type PatchVoucherRuleBody = Partial<CreateVoucherRuleBody>;

export interface DeleteVoucherRuleResponse {
  id: string;
  deleted: boolean;
}
