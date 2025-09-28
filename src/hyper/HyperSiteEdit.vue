<template>
  <v-container>
    <v-card>
      <v-card-title>Edit HyperSite</v-card-title>
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
                v-model="site.status"
                :items="statusItems"
                label="Status *"
                item-title="text"
                item-value="value"
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="4">
              <v-switch
                v-model="site.is_public"
                label="Public"
                inset
              ></v-switch>
            </v-col>
            <v-col cols="12" md="4">
              <v-switch
                v-model="site.use_proxy"
                label="Use Proxy"
                inset
              ></v-switch>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="site.encoding"
                label="Encoding (e.g. UTF-8)"
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
                <h4 class="mt-4">Field Mappings</h4>
                <v-list>
                  <v-list-item
                    v-for="(mapping, mIndex) in config.field_mappings"
                    :key="mIndex"
                    class="mb-2"
                  >
                    <v-row>
                      <v-col cols="3">
                        <v-text-field
                          v-model="mapping.field_name"
                          label="Field Name"
                          density="compact"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="3">
                        <v-text-field
                          v-model="mapping.field_path"
                          label="Field Path"
                          density="compact"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="2">
                        <v-text-field
                          v-model="mapping.field_attribute"
                          label="Attribute"
                          density="compact"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="2">
                        <v-text-field
                          v-model="mapping.default_value"
                          label="Default"
                          density="compact"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="1" class="d-flex align-center">
                        <v-checkbox
                          v-model="mapping.is_required"
                          label="Required"
                          density="compact"
                        ></v-checkbox>
                      </v-col>
                      <v-col cols="1" class="d-flex align-center">
                        <v-btn
                          icon="mdi-delete"
                          size="small"
                          color="error"
                          @click="removeFieldMapping(config, mIndex)"
                        ></v-btn>
                      </v-col>
                    </v-row>
                  </v-list-item>
                </v-list>

                <v-btn
                  size="small"
                  prepend-icon="mdi-plus"
                  color="primary"
                  @click="addFieldMapping(config)"
                >
                  Add Field Mapping
                </v-btn>
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
        <v-btn color="primary" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ResponseType,
  SiteStatus,
  HyperSite,
  SiteSearchConfig,
  SiteFieldMapping
} from '@/hyper/type'
import api from '@/api' // 替换为你的实际路径



const route = useRoute()
const router= useRouter()

// 表单数据
const site = ref<HyperSite>({
  id: 0,
  site_key: '',
  name: '',
  domain: '',
  status: SiteStatus.ACTIVE,
  search_configs: []
})

// 初始化数据
onMounted(async () => {
  if (route.params.id) {
    site.value = await api.get(`hyper_site/${route.params.id}`)
    // site.value = JSON.parse(JSON.stringify(props.initialSite)) // 深拷贝
  } else {
    // 默认新建
    site.value.search_configs = [createEmptySearchConfig()]
  }
})

// 枚举映射
const statusItems = [
  { text: 'Active', value: SiteStatus.ACTIVE },
  { text: 'Inactive', value: SiteStatus.INACTIVE }
]

const responseTypeItems = [
  { text: 'HTML', value: ResponseType.HTML },
  { text: 'RSS', value: ResponseType.RSS },
  { text: 'JSON', value: ResponseType.JSON }
]

const expandedPanels = ref<number[]>([0])

// 工具函数
const createEmptySearchConfig = (): SiteSearchConfig => ({
  search_path: '',
  search_method: 'GET',
  search_headers: {},
  search_body: {},
  response_type: ResponseType.HTML,
  field_mappings: []
})

const createEmptyFieldMapping = (): SiteFieldMapping => ({
  field_name: '',
  field_path: '',
  field_attribute: '',
  default_value: '',
  is_required: false
})

// 操作方法
const addSearchConfig = () => {
  site.value.search_configs?.push(createEmptySearchConfig())
  expandedPanels.value.push(site.value.search_configs?.length - 1)
}

const removeSearchConfig = (index: number) => {
  site.value.search_configs?.splice(index, 1)
}

const addFieldMapping = (config: SiteSearchConfig) => {
  if (!config.field_mappings) config.field_mappings = []
  config.field_mappings.push(createEmptyFieldMapping())
}

const removeFieldMapping = (config: SiteSearchConfig, index: number) => {
  config.field_mappings?.splice(index, 1)
}

const save = async () => {
  console.log('Saving site:', site.value)
  const res: { [key: string]: any } =await api.put(`hyper_site/`, site.value)

  console.log(res)
  if (res.success) {
    router.back()
  }else {
    alert(res.message)
  }
}

const cancel = () => {
  router.back()
}
</script>
