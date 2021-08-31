<template>
  <div class="login">
    <el-form size="mini" class="login-form" ref="form" :model="form" :rules="rules" label-width="80px">
      <p class="title">请登录</p>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-form-item label="保存状态">
        <el-switch v-model="form.save"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">
          <i class="el-icon-upload2"></i>登录</el-button>
        <el-button @click="onReset">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>


<script>
import request from ':/tools/request'
import storage from ':/tools/storage'

export default {
  name: 'login',
  data() {
    return {
      form: {
        username: '',
        password: '',
        save: false
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'change' },
          { min: 3, max: 32, message: '长度在 3 到 32 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'change' },
          { min: 6, max: 32, message: '长度在 6 到 32 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    onSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          request.post('/login', this.form)
              .then(async res => {
                if (this.form.save) {
                  await storage.setItem('token', res.data.token)
                  await this.$router.push('/')
                } else {
                  await storage.session.setItem('token', res.data.data)
                  await this.$router.push('/')
                }
              })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    onReset() {
      this.$refs.form.resetFields()
    }
  }
}
</script>

<style scoped lang="scss">
.login {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url("http://desktop.hmim.net/desktop/img/rand") no-repeat center center;
  background-size: cover;

  .login-form {
    width: 360px;
    padding: 15px;
    border: 1px solid $border;
    margin-top: -60px;
    border-radius: 8px;
    background: #ffffffaa;
    box-shadow: 0 0 300px #0005;

    p {
      text-align: center;
    }
  }
}
</style>
