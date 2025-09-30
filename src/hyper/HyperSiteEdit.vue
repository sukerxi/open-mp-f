<template>
  <div>
    <v-card>
      <v-card-title>{{pageTitle}}</v-card-title>
      <v-card-text>
        <!-- 基础信息 -->
        <v-form ref="form">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="site.name"
                label="Name *"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="site.domain"
                label="Domain *"
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="site.site_key"
                label="Site Key *"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="site.protocol"
                :items="protocolItems"
                label="协议 *"
                item-title="text"
                item-value="value"
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="3">
              <v-switch
                v-model="isActive"
                label="启用"
                inset
              ></v-switch>
            </v-col>
            <v-col cols="12" md="3">
              <v-switch
                v-model="site.is_public"
                label="公共"
                inset
              ></v-switch>
            </v-col>
            <v-col cols="12" md="3">
              <v-switch
                v-model="site.use_proxy"
                label="使用代理"
                inset
              ></v-switch>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="site.encoding"
                label="编码 (例 UTF-8)"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-textarea
            v-model="site.description"
            label="Description"
            rows="2"
          ></v-textarea>

          <!-- 搜索配置 -->
          <h3 class="mt-6 mb-4">Search Configurations</h3>
          <v-expansion-panels v-model="expandedPanels" multiple>
            <v-expansion-panel
              v-for="(config, index) in site.search_configs"
              :key="index"
            >
              <v-expansion-panel-title>
                Search Config {{ index + 1 }}
                <template #actions>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click.stop="removeSearchConfig(index)"
                  ></v-btn>
                </template>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="config.search_path"
                      label="Search Path"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="config.search_method"
                      label="Search Method (GET/POST)"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="config.response_type"
                      :items="responseTypeItems"
                      label="Response Type"
                      item-title="text"
                      item-value="value"
                    ></v-select>
                  </v-col>
                </v-row>

                <!-- Headers -->
<!--                <h4 class="mt-4">Headers</h4>-->
<!--                <KeyValueEditor v-model="config.search_headers" />-->

<!--                &lt;!&ndash; Body &ndash;&gt;-->
<!--                <h4 class="mt-4">Body (JSON)</h4>-->
<!--                <JsonEditor v-model="config.search_body" />-->

                <!-- 字段映射 -->
                <v-label class="mt-4 mb-2">Field Mappings</v-label>
                <v-form>
                  <v-row v-for="(mapping, mIndex) in config.field_mappings"
                         :key="mIndex"
                         class="mb-2">
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="mapping.field_path"
                        :label="`${FIXED_FIELD_NAMES.find(f => f.field_name === mapping.field_name)?.label || mapping.field_name} 路径`"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                        v-model="mapping.field_attribute"
                        label="Attribute"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                        v-model="mapping.default_value"
                        label="Default"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2" class="d-flex align-center">
                      <v-checkbox
                        v-model="mapping.is_required"
                        label="Required"
                      ></v-checkbox>
                    </v-col>
                    <!--                      <v-col cols="1" class="d-flex align-center">-->
                    <!--                        <v-btn-->
                    <!--                          icon="mdi-delete"-->
                    <!--                          size="small"-->
                    <!--                          color="error"-->
                    <!--                          @click="removeFieldMapping(config, mIndex)"-->
                    <!--                        ></v-btn>-->
                    <!--                      </v-col>-->
                  </v-row>
                </v-form>




<!--                <v-btn-->
<!--                  size="small"-->
<!--                  prepend-icon="mdi-plus"-->
<!--                  color="primary"-->
<!--                  @click="addFieldMapping(config)"-->
<!--                >-->
<!--                  Add Field Mapping-->
<!--                </v-btn>-->
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-btn
            class="mt-4"
            prepend-icon="mdi-plus"
            color="success"
            @click="addSearchConfig"
          >
            Add Search Config
          </v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" @click="cancel">Cancel</v-btn>
        <v-btn color="primary" @click="save">
          {{ isEditing ? '更新' : '创建' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ResponseType,
  SiteStatus,
  HyperSite,
  SiteSearchConfig,
  SiteFieldMapping, Protocol,
} from '@/hyper/type'
import api from '@/api'

const route = useRoute()
const router = useRouter()

// 判断是新增还是编辑
const isEditing = computed(() => !!route.params.id)

// 页面标题
const pageTitle = computed(() => isEditing.value ? '编辑站点' : '新增站点')

const protocolItems = [
  { text: 'HTTP', value: Protocol.HTTP },
  { text: 'HTTPS', value: Protocol.HTTPS }
]
// 表单数据
const site = ref<HyperSite>({
  id: 0,
  site_key: '',
  name: '',
  domain: '',
  status: SiteStatus.ACTIVE,
  protocol: protocolItems[0].value,
  is_public: true,
  use_proxy: false,
  encoding: 'UTF-8',
  description: '',
  search_configs: []
})

const responseTypeItems = [
  { text: 'RSS', value: ResponseType.RSS },
  { text: 'HTML', value: ResponseType.HTML },
  { text: 'JSON', value: ResponseType.JSON }
]
// 默认 XPath 映射
const DEFAULT_FIELD_PATHS: Record<string, string> = {
  item_list: '//channel//item',
  id: './/guid/text()',
  download: './/enclosure/@url',
  date_added: './/pubDate/text()',
  size: './/enclosure/@length',
  description: './/description/text()',
  detail_url: './/link/text()',
  title: './/title/text()',
}
// 固定字段映射模板（不可增删）
const FIXED_FIELD_NAMES = [
  { field_name: 'item_list', label: '列表' },
  { field_name: 'id', label: 'id' },
  { field_name: 'title', label: '标题' },
  { field_name: 'detail_url', label: '详情连接' },
  { field_name: 'size', label: '文件大小' },
  { field_name: 'date_added', label: '发布时间' },
  { field_name: 'download', label: '下载链接' },
  { field_name: 'description', label: '描述' },

  // 可根据实际需求增减
]
// 生成固定结构的 field_mappings，带默认路径
const createFixedFieldMappings = (): SiteFieldMapping[] => {
  return FIXED_FIELD_NAMES.map(({ field_name }) => ({
    field_name,
    field_path: DEFAULT_FIELD_PATHS[field_name] || '',
    field_attribute: '',
    default_value: '',
    is_required: true
  }))
}

const expandedPanels = ref<number[]>([0])

// 工具函数
const createEmptySearchConfig = (): SiteSearchConfig => ({
  search_path: '',
  search_method: 'GET',
  search_headers: {},
  search_body: {},
  response_type: ResponseType.RSS,
  field_mappings: createFixedFieldMappings()
})

const createEmptyFieldMapping = (): SiteFieldMapping => ({
  field_name: '',
  field_path: '',
  field_attribute: '',
  default_value: '',
  is_required: false
})

const isActive = computed({
  get: () => site.value.status === SiteStatus.ACTIVE,
  set: (val) => {
    site.value.status = val ? 1 : 2;
  }
});


// 初始化
onMounted(async () => {
  if (isEditing.value) {
    try {
      site.value  = await api.get(`hyper_site/${route.params.id}`)
      // 确保每个 search_config 使用固定字段结构，并合并后端数据
      site.value.search_configs = site.value.search_configs.map(config => {
        const fixedMappings = createFixedFieldMappings()
        const backendMappings = config.field_mappings || []

        // 将后端返回的映射按 field_name 合并到固定结构中
        const mergedMappings = fixedMappings.map(fixed => {
          const matched = backendMappings.find(b => b.field_name === fixed.field_name)
          return matched ? { ...fixed, ...matched } : fixed
        })

        return { ...config, field_mappings: mergedMappings }
      })

      if (site.value.search_configs.length === 0) {
        site.value.search_configs = [createEmptySearchConfig()]
      }
      expandedPanels.value = site.value.search_configs.map((_, i) => i)
    } catch (err) {
      alert('加载站点失败')
      router.back()
    }
  }else {
    // 新建：默认一个空配置
    site.value.search_configs = [createEmptySearchConfig()]
  }
})

// 操作方法
const addSearchConfig = () => {
  site.value.search_configs.push(createEmptySearchConfig())
  expandedPanels.value.push(site.value.search_configs.length - 1)
}

const removeSearchConfig = (index: number) => {
  site.value.search_configs.splice(index, 1)
  // 更新展开面板索引（可选）
  expandedPanels.value = expandedPanels.value.filter(i => i !== index).map(i => i > index ? i - 1 : i)
}

const addFieldMapping = (config: SiteSearchConfig) => {
  if (!config.field_mappings) config.field_mappings = []
  config.field_mappings.push(createEmptyFieldMapping())
}

const removeFieldMapping = (config: SiteSearchConfig, index: number) => {
  config.field_mappings?.splice(index, 1)
}

const save = async () => {
  try {
    let res: { [key: string]: any }
    if (isEditing.value) {
      const {created_at,updated_at,...payload} = { ...site.value }
      res = await api.put(`hyper_site/`, payload)
    } else {
      // 新增用 POST，且不传 id
      const {id,created_at,updated_at,...payload} = { ...site.value }
      res = await api.post('hyper_site/', payload)
    }
    if (res.success) {
      router.back()
    } else {
      alert(res.message || '操作失败')
    }
  } catch (err) {
    alert('网络错误或保存失败')
  }
}

const cancel = () => {
  router.back()
}
</script>
