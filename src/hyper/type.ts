// Enums
enum ResponseType {
  HTML = "HTML",
  RSS = "RSS",
  JSON = "JSON"
}

enum SiteStatus {
  ACTIVE = 1,
  INACTIVE = 2
}

// Interfaces
interface HyperSite {
  id: number;
  site_key: string;
  name: string;
  domain: string;
  encoding?: string;
  is_public?: boolean;
  use_proxy?: boolean;
  status: number; // 可考虑用 SiteStatus 枚举类型
  description?: string;
  created_at?: string; // ISO 8601 datetime string
  updated_at?: string;
  search_configs?: SiteSearchConfig[];
}

interface SiteSearchConfig {
  id?: number;
  site_id?: number;
  search_path?: string;
  search_method?: string;
  search_headers?: { [key: string]: string };
  search_body?: { [key: string]: string };
  response_type?: ResponseType;
  created_at?: string;
  updated_at?: string;
  field_mappings?: SiteFieldMapping[];
}

interface SiteFieldMapping {
  id?: number;
  site_id?: number;
  search_config_id?: number;
  field_name?: string;
  field_path?: string;
  field_attribute?: string;
  filters?: any[]; // 或定义更具体的类型
  default_value?: string;
  is_required?: boolean;
  description?: string;
}
