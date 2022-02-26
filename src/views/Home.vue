<template>
  <el-container direction="vertical">
    <el-main style="--el-main-padding:3px">
      <div style="text-align:left;margin-bottom: 5px">
        <el-button type="success" @click="addRecord">添加</el-button>
      </div>

      <el-form inline style="text-align: left">
        <el-form-item>
          <el-select v-model="params.filter.position" clearable filterable placeholder="地块" style="width:150px" @change="refresh()">
            <el-option v-for="item in options.position" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="params.filter.typeO" clearable filterable placeholder="操作" style="width:150px" @change="refresh()">
            <el-option v-for="item in options.typeO" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="params.filter.typeV" clearable filterable placeholder="蔬菜" style="width:150px" @change="refresh()">
            <el-option v-for="item in options.typeV" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-pagination
          :current-page.sync="params.page"
          :default-current-page="1"
          :page-size="params.size"
          :page-sizes="[10,20,30,50,100]"
          :pager-count="5"
          :total="total"
          layout="sizes, total,prev, pager, next,jumper"
          small
          @current-change="refresh"
          @size-change="sizeChange"
      />

      <el-table :data="data">
        <el-table-column v-if="clientMode==='PC端'" label="" width="40px">
          <template #default="s">
            <el-icon class="delete-icon" color="red" @click="deleteRecord(s.row.uuid)">
              <delete-filled />
            </el-icon>
            <el-icon class="delete-icon" color="red" @click="editRecord(s.row)">
              <edit />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column label="操作时间" width="100px">
          <template #default="s">
            <el-tooltip>
              <template #content>
                记录时间：
                <my-timestamp :time="s.row.timeR" />
                <el-icon v-if="clientMode!=='PC端'" class="delete-icon" color="red" @click="deleteRecord(s.row.uuid)">
                  <delete-filled />
                </el-icon>
              </template>
              <span>
                <my-timestamp :time="s.row.timeO" />
                <el-icon v-if="clientMode!=='PC端'" class="delete-icon" color="red" @click="editRecord(s.row)">
                  <edit />
                </el-icon>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column v-if="!params.filter.position" label="地块" prop="position" width="80px" />
        <el-table-column v-if="!params.filter.typeO" label="操作" prop="typeO" width="80px" />
        <el-table-column v-if="!params.filter.typeV" label="蔬菜" prop="typeV" width="80px" />
        <el-table-column v-if="totalImages>0" label="图片" prop="images.length" width="80px" />
        <el-table-column label="详情" prop="description">
          <template #default="s">
            <span @click="showDetail(s.row.uuid)">{{ s.row.description ? s.row.description : '暂无' }}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog v-model="showDialogDetail" :width="clientMode==='PC端'?'50%':'90%'" title="详情">
        <el-upload
            drag
            multiple
            :data="{recordUuid:currentUuid}"
            :file-list="fileList"
            :on-success="uploadSuccess"
            action="/api/images/upload"
            class="upload-demo"
        >
<!--          <el-button type="primary">上传</el-button>-->
          <div class="el-upload-dragger" >
            拖拽文件到此 或 点击上传
          </div>
        </el-upload>
        <div>
          <span v-for="(item,i) in images">
            <el-image

                :initial-index="i"
                :preview-src-list="imagePath"
                :src="imagePath[i]"
                hide-on-click-modal
                style="width: 100px; height: 100px"
            />
            <el-button type="danger" @click="deleteImage(item.uuid)">
              <el-icon color="white">
                <delete />
              </el-icon>
            </el-button>
          </span>
        </div>
      </el-dialog>

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
                v-if="dialogTitle === '添加'"
                v-model="record.typeVs"
                allow-create
                clearable
                default-first-option
                filterable
                multiple
            >
              <el-option v-for="item in options.typeV" v-if="options.typeV" :label="item" :value="item" />
            </el-select>
            <el-select
                v-else
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
import {Delete, DeleteFilled, Edit} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {copyObj} from "@/assets/js/utils/ObjectUtils";

export default {
  name: 'Home',
  components: {MyTimestamp, DeleteFilled, Edit, Delete},
  computed: {
    ...mapState('client', [`clientMode`])
  },
  data() {
    return {
      options: {},
      dialogTitle: "添加",
      showDialog: false,
      showDialogDetail: false,
      currentUuid: "",
      data: [],
      total: 100,
      images: [],
      imagePath: [],
      fileList: [],
      totalImages: 0,
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
        typeVs: undefined,
        typeV: undefined,
        typeO: undefined,
        description: undefined,
      },
    }
  },
  methods: {
    ...mapActions("record", [`add`, `page`, `del`, `getOptions`, `update`]),
    ...mapActions('image', {
      list: 'list',
      delImage: 'del',
    }),
    sizeChange(e) {
      this.params.size = e;
      this.refresh()
    },
    deleteImage(uuid) {
      console.log(uuid)
      ElMessageBox.confirm("确认删除？", "确认删除这张图片？", {type: 'warning', 'button-size': 'small'}).then(() => {
        this.delImage(uuid).then(() => {
          ElMessage.success("删除成功");
          this.listImage(this.currentUuid)
        })
      })
    },
    deleteRecord(uuid) {
      ElMessageBox.confirm("确认删除？", "确认删除这条记录？", {type: 'warning', 'button-size': 'small'}).then(() => {
        this.del(uuid).then(() => {
          ElMessage.success("删除成功");
          this.refresh()
        })
      })
    },
    uploadSuccess(res, file, fileList) {
      ElMessage.success("上传成功")
      console.log(file)
      console.log(fileList)
      this.listImage(this.currentUuid)
      setTimeout(() => {
        this.fileList = fileList.filter(i => i.name !== file.name)
      }, 2000)
    },
    async listImage(uuid) {
      this.images = await this.list(uuid)
      this.imagePath = this.images.map(i => '/images' + i.path);
    },
    showDetail(uuid) {
      this.currentUuid = uuid;
      this.showDialogDetail = true;
      this.listImage(uuid);
    },
    addRecord() {
      if (this.record.uuid) {
        this.record = {}
      }
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
        this.record = {}
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
    async refresh(e) {
      this.params.page = e ? e : this.params.page;
      this.options = await this.getOptions()
      const {current, total, records} = await this.page(this.params)
      this.params.page = current;
      this.total = total
      this.data = records;

      this.totalImages = 0;
      records.forEach(i => this.totalImages += i.images.length)

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
