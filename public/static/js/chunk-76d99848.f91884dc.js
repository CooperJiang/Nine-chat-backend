(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-76d99848"],{"07e1":function(e,s,r){"use strict";r("e987")},"0ab2":function(e,s,r){e.exports=r.p+"static/img/logo.35762dc1.gif"},dd7b:function(e,s,r){"use strict";r.r(s);r("cdf1");var t=function(){var e=this,s=e._self._c;return s("div",{staticClass:"login"},[s("div",{staticClass:"login-container"},[e._m(0),s("div",{staticClass:"form"},[s("el-form",{ref:"loginForm",attrs:{model:e.form,rules:e.rules}},[s("el-form-item",{attrs:{prop:"user_name"}},[s("el-input",{attrs:{clearable:"",placeholder:"您的账户或邮箱",size:"medium"},model:{value:e.form.user_name,callback:function(s){e.$set(e.form,"user_name",s)},expression:"form.user_name"}})],1),s("el-form-item",{attrs:{prop:"user_password"}},[s("el-input",{attrs:{clearable:"","show-password":"",placeholder:"您的账户密码",size:"medium"},nativeOn:{keyup:function(s){return!s.type.indexOf("key")&&e._k(s.keyCode,"enter",13,s.key,"Enter")?null:e.login.apply(null,arguments)}},model:{value:e.form.user_password,callback:function(s){e.$set(e.form,"user_password",s)},expression:"form.user_password"}})],1)],1)],1),s("div",{staticClass:"links"},[s("a",{on:{click:e.foegetPassword}},[e._v("忘记密码")]),s("a",{on:{click:function(s){return e.$router.push("/register")}}},[e._v("注册账号")])]),s("el-button",{staticStyle:{width:"100%"},attrs:{type:"primary",size:"medium"},on:{click:e.login}},[e._v("登录小九聊天室")])],1)])},a=[function(){var e=this,s=e._self._c;return s("div",{staticClass:"logo"},[s("img",{attrs:{src:r("0ab2")}}),s("span",{staticClass:"logo-name"},[e._v("小九音乐聊天室")])])}],o=r("c24f"),n={components:{},data(){return{form:{user_name:"",user_password:""},rules:{user_name:[{required:!0,message:"请输入您的账号",trigger:"blur"},{min:1,max:8,message:"长度在 1 到 16 个字符",trigger:"blur"}],user_password:[{required:!0,message:"请输入您的账户密码",trigger:"blur"},{min:6,max:32,message:"长度在 6 到 32 个字符",trigger:"blur"}]}}},computed:{},watch:{},created(){localStorage.user_name&&(this.form.user_name=localStorage.user_name),localStorage.user_password&&(this.form.user_password=localStorage.user_password)},mounted(){},methods:{login(){this.$refs.loginForm.validate(async e=>{if(!e)return;const{data:s}=await Object(o["b"])(this.form),{token:r}=s;localStorage.chat_token=r,this.$router.push("/");const{user_name:t,user_password:a}=this.form;localStorage.user_name=t,localStorage.user_password=a})},foegetPassword(){return this.$message.warning("都没邮箱验证，你找不回密码洛！")},testLogin(){this.form.user_name="test",this.form.user_password="123456",this.login()}}},i=n,l=(r("07e1"),r("36a2")),u=Object(l["a"])(i,t,a,!1,null,"3d96d8a5",null);s["default"]=u.exports},e987:function(e,s,r){}}]);