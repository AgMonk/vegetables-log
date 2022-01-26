<template>
  <el-container direction="vertical">
    <el-main style="--el-main-padding:3px">
      <el-button type="success" @click="addRecord">添加</el-button>
      <el-form inline style="text-align: left">
        <el-form-item>
          <el-select v-model="params.filter.position" placeholder="地块" @change="refresh" clearable style="width:150px">
            <el-option v-for="item in options.position" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="params.filter.typeO" placeholder="操作" @change="refresh" clearable style="width:150px">
            <el-option v-for="item in options.typeO" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="params.filter.typeV" placeholder="蔬菜" @change="refresh" clearable style="width:150px">
            <el-option v-for="item in options.typeV" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-pagination
          :current-page.sync="params.page"
          :default-current-page="1"
          :page-size="params.size"
          :pager-count="5"
          :total="total"
          layout="total,prev, pager, next,jumper"
          small
          @current-change="refresh"
      />

      <el-table :data="data">
        <el-table-column label="记录时间" width="100px">
          <template #default="s">
            <my-timestamp :time="s.row.timeR" />
            <el-icon class="delete-icon" color="red" @click="deleteRecord(s.row.uuid)">
              <delete-filled />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column label="操作时间" width="100px">
          <template #default="s">
            <my-timestamp :time="s.row.timeO" />
            <el-icon class="delete-icon" color="red" @click="editRecord(s.row)">
              <edit />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column label="地块" prop="position" width="80px" v-if="!params.filter.position" />
        <el-table-column label="操作" prop="typeO" width="80px"  v-if="!params.filter.typeO" />
        <el-table-column label="蔬菜" prop="typeV" width="80px"  v-if="!params.filter.typeV" />
        <el-table-column label="详情" prop="description" />
      </el-table>
      <el-dialog v-model="showDialog" :title="dialogTitle" :width="clientMode==='PC端'?'50%':'90%'">
        <el-form :model="record">
          <el-form-item label="操作时间">
            <el-date-picker
                v-model="record.timeO"
                type="datetime"
                value-format="X"
            />
            <span class="tips">不填默认为当前时间</span>
          </el-form-item>
          <el-form-item label="地块" prop="position">
            <el-select
                v-model="record.position"
                allow-create
                clearable
                default-first-option
                filterable
            >
              <el-option v-for="item in options.position" v-if="options.position" :label="item" :value="item" />
            </el-select>
            <span class="tips">必填</span>
          </el-form-item>
          <el-form-item label="操作" prop="typeO">
            <el-select
                v-model="record.typeO"
                allow-create
                clearable
                default-first-option
                filterable
            >
              <el-option v-for="item in options.typeO" v-if="options.typeO" :label="item" :value="item" />
            </el-select>
            <span class="tips">必填</span>
          </el-form-item>
          <el-form-item label="蔬菜" props="typeV">
            <el-select
                v-model="record.typeV"
                allow-create
                clearable
                default-first-option
                filterable
            >
              <el-option v-for="item in options.typeV" v-if="options.typeV" :label="item" :value="item" />
            </el-select>
            <span class="tips">必填</span>
          </el-form-item>
          <el-form-item label="详情">
            <el-input v-model="record.description"
                      clearable type="textarea"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="submit">提交</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

    </el-main>
  </el-container>
</template>

<script>
// @ is an alias to /src
import {mapActions, mapState} from "vuex";
import MyTimestamp from "@/components/my/my-timestamp";
import {DeleteFilled, Edit} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {copyObj} from "@/assets/js/utils/ObjectUtils";

export default {
  name: 'Home',
  components: {MyTimestamp, DeleteFilled, Edit},
  computed: {
    ...mapState('client',[`clientMode`])
  },
  data() {
    return {
      options: {},
      dialogTitle: "添加",
      showDialog: false,
      data: [],
      total: 100,
      params: {
        page: 1,
        size: 10,
        filter: {
          timeStart: undefined,
          timeEnd: undefined,
          position: undefined,
          typeV: undefined,
          typeO: undefined,
          description: undefined,
        }
      },
      record: {
        uuid: undefined,
        timeR: undefined,
        timeO: undefined,
        position: undefined,
        typeV: undefined,
        typeO: undefined,
        description: undefined,
      },
    }
  },
  methods: {
    ...mapActions("record", [`add`, `page`, `del`, `getOptions`, `update`]),
    deleteRecord(uuid) {
      ElMessageBox.confirm("确认删除？", "确认删除这条记录？", {type: 'warning', 'button-size': 'small'}).then(() => {
        this.del(uuid).then(() => {
          ElMessage.success("删除成功");
          this.refresh()
        })
      })
    },
    addRecord() {
      this.record = {}
      this.dialogTitle = '添加'
      this.showDialog = true;
    },
    editRecord(item) {
      this.record = copyObj(item)
      this.dialogTitle = '修改'
      this.showDialog = true;
    },
    async submit() {
      if (this.dialogTitle === '添加') {
        const res = await this.add(this.record);
        console.log(res)
      }
      if (this.dialogTitle === '修改') {
        const res = await this.update(this.record);
        console.log(res)
      }
      await this.refresh()
      this.showDialog = false;
      this.record = {};
    },
    async refresh() {
      this.options = await this.getOptions()
      const {current, total, records} = await this.page(this.params)
      this.params.page = current;
      this.total = total
      this.data = records;

      console.log(this.options)
      console.log(this.data)
    }
  },
  async mounted() {
    await this.refresh()
  }
}
</script>
<style scoped>
.tips {
  color: red;
  margin-left: 5px;
}

.delete-icon {
  cursor: pointer;
}
</style>
