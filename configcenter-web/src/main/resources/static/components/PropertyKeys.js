// 配置key管理组件
const PropertyKeysTemplate = `
<div>
    <el-row style="margin-bottom: 10px">
        <el-col :span="16">
            <span style="font-size: large;">环境：</span>
            <router-link v-for="(profile, index) in allProfiles" v-if="index < 8" :to="'/configs/' + appId + '/' + profile.profileId" :key="profile.profileId" style="margin-right: 10px">
                <el-button type="text">{{ profile.profileId }}</el-button>
            </router-link>
            <router-link v-if="allProfiles.length > 8" :to="'/configs/' + appId + '/' + allProfiles[0].profileId" style="margin-right: 10px">
                <el-button type="text" icon="el-icon-more"></el-button>
            </router-link>
        </el-col>
        <el-col :span="8" style="text-align: right;">
            <router-link :to="'/configs/' + appId + '/operatePrivileges'">
                <el-button type="text">操作权限</el-button>
            </router-link>
        </el-col>
    </el-row>
    <div v-for="appPropertyKey in appPropertyKeys" style="margin-bottom: 30px">
        <el-row v-if="appPropertyKey.app.appId === appId" style="margin-bottom: 10px">
            <el-col :offset="4" :span="16" style="text-align: center;">
                <span style="font-size: x-large;color: #409EFF;">{{ toShowingApp(appPropertyKey.app) }}</span>
            </el-col>
            <el-col :span="4" style="text-align: end;">
                <el-button type="primary" icon="el-icon-plus" @click="addPropertyKeyVisible = true" size="small">新增配置项</el-button>
            </el-col>
        </el-row>
        <el-row v-else style="margin-bottom: 10px">
            <el-col :offset="4" :span="16" style="text-align: center">
                <span style="font-size: large;color: #67c23a;">{{ toShowingApp(appPropertyKey.app) }}</span>
            </el-col>
        </el-row>
        <el-table :data="appPropertyKey.propertyKeys"
                  v-loading="loading"
                  :key="appPropertyKey.app.appId"
                  :default-sort="{prop: 'key'}"
                  :style="{width: appPropertyKey.app.appId === appId ? '100%' : 'calc(100% - 130px)'}"
                  :cell-style="{padding: '3px 0px'}"
                  border stripe>
            <el-table-column prop="key" label="配置key" sortable>
                <template slot-scope="{ row }">
                    <span class="propertyKey-text-style">{{ row.key }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="memo" label="备注">
                <template slot-scope="{ row }">
                    <span v-if="!row.editing" class="propertyKey-text-style">{{ row.memo }}</span>
                    <el-input v-else v-model="row.editingMemo" size="mini" clearable placeholder="请输入备注"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="scope" label="作用域" sortable width="120px">
                <template slot-scope="{ row }">
                    <div v-if="!row.editing">
                        <el-tag v-if="row.scope === 'PRIVATE'" size="medium">私有</el-tag>
                        <el-tag v-else-if="row.scope === 'PROTECTED'" type="success" size="medium">可继承</el-tag>
                        <el-tag v-else-if="row.scope === 'PUBLIC'" type="warning" size="medium">公开</el-tag>
                    </div>
                    <el-select v-else v-model="row.editingScope" size="mini" placeholder="请选择作用域" style="width: 90%">
                        <el-option value="PRIVATE" label="私有" size="medium"></el-option>
                        <el-option value="PROTECTED" label="可继承" size="medium"></el-option>
                        <el-option value="PUBLIC" label="公开" size="medium"></el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column prop="privilege" label="操作权限" sortable width="120px">
                <template slot-scope="{ row }">
                    <el-tag v-if="row.privilege === 'READ_WRITE'" type="success" size="medium">读写</el-tag>
                    <el-tag v-else-if="row.privilege === 'READ'" type="warning" size="medium">只读</el-tag>
                    <el-tag v-else-if="row.privilege === 'NONE'" type="danger" size="medium">无</el-tag>
                </template>
            </el-table-column>
            <el-table-column v-if="appPropertyKey.app.appId === appId" label="操作" header-align="center" width="130px">
                <template slot-scope="{ row }">
                    <el-row>
                        <el-col :span="16" style="text-align: center">
                            <el-tooltip v-if="!row.editing" content="修改" placement="top" :open-delay="1000" :hide-after="3000">
                                <el-button @click="startEditing(row)" type="primary" :disabled="manager.type==='NORMAL' && row.privilege!=='READ_WRITE'" icon="el-icon-edit" size="mini" circle></el-button>
                            </el-tooltip>
                            <template v-else>
                                <el-button-group>
                                    <el-tooltip content="取消修改" placement="top" :open-delay="1000" :hide-after="3000">
                                        <el-button @click="row.editing = false" type="info" icon="el-icon-close" size="mini" circle></el-button>
                                    </el-tooltip>
                                    <el-tooltip content="保存修改" placement="top" :open-delay="1000" :hide-after="3000">
                                        <el-button @click="saveEditing(row)" type="success" icon="el-icon-check" size="mini" circle></el-button>
                                    </el-tooltip>
                                </el-button-group>
                            </template>
                        </el-col>
                        <el-col :span="8" style="text-align: center">
                            <el-tooltip content="删除" placement="top" :open-delay="1000" :hide-after="3000">
                                <el-button @click="deletePropertyKey(row)" type="danger" :disabled="manager.type==='NORMAL' && row.privilege!=='READ_WRITE'" icon="el-icon-delete" size="mini" circle></el-button>
                            </el-tooltip>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <el-dialog :visible.sync="addPropertyKeyVisible" :before-close="closeAddPropertyKeyDialog" title="新增配置项" width="40%">
        <el-form ref="addPropertyKeyForm" :model="addPropertyKeyForm" label-width="20%">
            <el-form-item label="配置key" prop="key" :rules="[{required:true, message:'请输入配置key', trigger:'blur'}]">
                <el-input v-model="addPropertyKeyForm.key" clearable placeholder="请输入配置key" style="width: 90%"></el-input>
            </el-form-item>
            <el-form-item label="作用域" prop="scope" :rules="[{required:true, message:'请选择作用域', trigger:'blur'}]">
                <el-select v-model="addPropertyKeyForm.scope" placeholder="请选择作用域" style="width: 90%">
                    <el-option value="PRIVATE" label="私有"></el-option>
                    <el-option value="PROTECTED" label="可继承"></el-option>
                    <el-option value="PUBLIC" label="公开"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="备注">
                <el-input v-model="addPropertyKeyForm.memo" clearable placeholder="请输入备注" style="width: 90%"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer">
            <el-button @click="closeAddPropertyKeyDialog">取消</el-button>
            <el-button type="primary" @click="addPropertyKey">提交</el-button>
        </div>
    </el-dialog>
</div>
`;

const PropertyKeys = {
    template: PropertyKeysTemplate,
    props: ['appId'],
    data: function () {
        return {
            manager: CURRENT_MANAGER,
            allProfiles: [],
            loading: false,
            appPropertyKeys: [],
            addPropertyKeyVisible: false,
            addPropertyKeyForm: {
                key: null,
                scope: null,
                memo: null
            }
        };
    },
    created: function () {
        this.findAllProfiles();
        this.findAppPropertyKeys();
    },
    methods: {
        findAllProfiles: function () {
            const theThis = this;
            axios.get('../manage/profile/findProfileTree', {
                params: {
                    profileId: null
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                let extractProfiles = function (profileTree, level) {
                    let profiles = [];
                    if (profileTree.profile !== null) {
                        profileTree.profile.level = level;
                        profiles.push(profileTree.profile);
                    }
                    profileTree.children.forEach(function (child) {
                        profiles = profiles.concat(extractProfiles(child, level + 1));
                    });
                    return profiles;
                };
                theThis.allProfiles = extractProfiles(result.profileTree, -1);
            });
        },
        findAppPropertyKeys: function () {
            const theThis = this;
            theThis.loading = true;
            axios.get('../manage/propertyKey/findInheritedPropertyKeys', {
                params: {
                    appId: theThis.appId
                }
            }).then(function (result) {
                if (!result.success) {
                    theThis.loading = false;
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                const appPropertyKeys = result.appPropertyKeys;
                axios.get('../manage/operatePrivilege/findInheritedOperatePrivileges', {
                    params: {
                        appId: theThis.appId
                    }
                }).then(function (result) {
                    theThis.loading = false;
                    if (!result.success) {
                        Vue.prototype.$message.error(result.message);
                        return;
                    }
                    const appOperatePrivileges = result.appOperatePrivileges;
                    for (let i = 0; i < appPropertyKeys.length; i++) {
                        appPropertyKeys[i].propertyKeys.forEach(function (propertyKey) {
                            propertyKey.editing = false;
                            propertyKey.editingScope = null;
                            propertyKey.editingMemo = null;
                            for (let j = i; j < appOperatePrivileges.length; j++) {
                                const keyRegexPrivileges = appOperatePrivileges[j].keyRegexPrivileges;
                                for (let keyRegex in keyRegexPrivileges) {
                                    let regex = keyRegex;
                                    if (!regex.startsWith('^')) {
                                        regex = '^' + regex;
                                    }
                                    if (!regex.endsWith('$')) {
                                        regex += '$';
                                    }
                                    if (new RegExp(regex).test(propertyKey.key)) {
                                        propertyKey.privilege = keyRegexPrivileges[keyRegex];
                                        return;
                                    }
                                }
                            }
                            propertyKey.privilege = 'READ_WRITE';
                        });
                    }
                    theThis.appPropertyKeys = appPropertyKeys;
                });
            });
        },
        startEditing: function (propertyKey) {
            propertyKey.editing = true;
            propertyKey.editingScope = propertyKey.scope;
            propertyKey.editingMemo = propertyKey.memo;
        },
        saveEditing: function (propertyKey) {
            this.doAddOrModifyPropertyKey({
                appId: propertyKey.appId,
                key: propertyKey.key,
                scope: propertyKey.editingScope,
                memo: propertyKey.editingMemo
            }, function () {
                propertyKey.editing = false;
                propertyKey.scope = propertyKey.editingScope;
                propertyKey.memo = propertyKey.editingMemo;
            });
        },
        deletePropertyKey: function (propertyKey) {
            const theThis = this;
            Vue.prototype.$confirm('确定删除配置key？', '警告', {type: 'warning'})
                .then(function () {
                    axios.post('../manage/propertyKey/deletePropertyKey', {
                        appId: propertyKey.appId,
                        key: propertyKey.key
                    }).then(function (result) {
                        if (!result.success) {
                            Vue.prototype.$message.error(result.message);
                            return;
                        }
                        Vue.prototype.$message.success(result.message);
                        theThis.findAppPropertyKeys();
                    });
                });
        },
        addPropertyKey: function () {
            const theThis = this;
            this.$refs.addPropertyKeyForm.validate(function (valid) {
                if (!valid) {
                    return;
                }
                const params = Object.assign({appId: theThis.appId}, theThis.addPropertyKeyForm);
                theThis.doAddOrModifyPropertyKey(params, function () {
                    theThis.closeAddPropertyKeyDialog();
                    theThis.findAppPropertyKeys();
                });
            })
        },
        closeAddPropertyKeyDialog: function () {
            this.addPropertyKeyVisible = false;
            this.addPropertyKeyForm.key = null;
            this.addPropertyKeyForm.scope = null;
            this.addPropertyKeyForm.memo = null;
        },
        toShowingApp: function (app) {
            if (!app) {
                return '';
            }
            let text = app.appId;
            if (app.appName) {
                text += '（' + app.appName + '）';
            }
            return text;
        },
        doAddOrModifyPropertyKey: function (params, successCallback) {
            const theThis = this;
            this.loading = true;
            axios.post('../manage/propertyKey/addOrModifyPropertyKey', params)
                .then(function (result) {
                    theThis.loading = false;
                    if (!result.success) {
                        Vue.prototype.$message.error(result.message);
                        return;
                    }
                    Vue.prototype.$message.success(result.message);
                    successCallback();
                });
        }
    }
};