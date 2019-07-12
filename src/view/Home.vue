<template>
  <div id="app">
    <van-nav-bar
      title="首页" fixed
    />
    <div id="mainPanel">
      <div>id: {{id}}</div>
      <van-button size="large" @click="scan()">我要打卡</van-button>
      <van-button size="large" @click="scan2()">我要扫描</van-button>
      <van-button size="large" @click="mypos()">我的位置</van-button>     
      <div id="atlas"></div>
      <div>离公司的距离为: {{distance}}</div>
      <van-button size="large" @click="openmodalwebview()">openmodalwebview</van-button>
      <van-button size="large" type="primary" @click="openwebview()">openwebview</van-button>
      <van-button size="large" type="danger" @click="closewebview()">close</van-button>
      <van-button size="large" @click="download()">下载</van-button>
      <div>正在下载中({{progress}}%)...</div>
    </div>
  </div>
</template>

<script>
import { Toast, Notify, Progress, NavBar, Panel, Row, Col, Icon, Button } from 'vant';
import { TMap } from '../api/map';

export default {
  components: {
    [Progress.name]: Progress,
    [NavBar.name]: NavBar,
    [Button.name]: Button,
    [Panel.name]: Panel,
    [Row.name]: Row,
    [Col.name]: Col,
    [Icon.name]: Icon
  },
  data() {
    return {
      ready: false,
      progress: 0,
      id: '',
      latitude: 0,
      longitude: 0,
      distance: 0
    };
  },
  sockets: {
    connect() {
      this.id = this.$socket.id;
    },
    ok() {
      Toast.clear();
      Toast.success('验证成功');
    },
    sendcode(data) {
      this.qr = JSON.stringify(data);
    }
  },
  methods: {
    mapTX() {
      var _this = this;
      TMap().then(qq => {
        qq.maps.convertor.translate(new qq.maps.LatLng(_this.latitude, _this.longitude), 1, function(res) {
          var latlng = res[0];
          var map = new qq.maps.Map(document.getElementById('atlas'), {
            center: new qq.maps.LatLng(latlng.getLat(), latlng.getLng()),
            zoom: 16
          });
          var start = new qq.maps.LatLng(22.7002275158, 113.9840555191);
          var end = new qq.maps.LatLng(latlng.getLat(), latlng.getLng());
          _this.distance = Math.round(qq.maps.geometry.spherical.computeDistanceBetween(start, end) * 10) / 10;
          var marker = new qq.maps.Marker({
            map: map,
            position: latlng
          });
          Toast.clear();
          console.log(marker);
        });
      });
    },
    initialize() {
      document.addEventListener(
        'deviceready',
        this.onDeviceReady.bind(this),
        false
      );
    },
    // deviceready Event Handler
    onDeviceReady() {
      this.ready = true;
    },
    mypos() {
      Toast.loading({
        mask: true,
        message: '正在获取位置'
      });
      var _this = this;
      navigator.geolocation.getCurrentPosition(
        function(position) {
          _this.latitude = position.coords.latitude;
          _this.longitude = position.coords.longitude;
          // alert('纬度: ' + position.coords.latitude + '\n' +
          //   '经度: ' + position.coords.longitude + '\n' +
          //   '海拔: ' + position.coords.altitude + '\n' +
          //   '水平精度: ' + position.coords.accuracy + '\n' +
          //   '垂直精度: ' + position.coords.altitudeAccuracy + '\n' +
          //   '方向: ' + position.coords.heading + '\n' +
          //   '速度: ' + position.coords.speed + '\n' +
          //   '时间戳: ' + position.timestamp + '\n');
          _this.mapTX();
        },
        function(error) {
          Toast.clear();
          alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
        },
        { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
    },
    openmodalwebview() {
      var modal = new ModalWebView(function() {
        console.log('modal closed');
      });
      modal.setErrorTextColor(0xFFFFFF);
      modal.setErrorBackgroundColor(0xEE0044);
      modal.setOrientation('portrait');
      // var url = 'https://apis.map.qq.com/uri/v1/geocoder?coord_type=1&coord=' + this.latitude + ',' + this.longitude + '&referer=qrtest';
      var url = 'http://210.75.13.196/demo1/';
      modal.open(url, 'demo1');
    },
    openwebview() {
      // webview.Show('http://210.75.13.196/demo');
      // PGMultiView.loadView('http://210.75.13.196/demo1/', '{}', null, null);
      PGMultiView.loadView('index.html', '{}', null, null);
    },
    closewebview() {
      PGMultiView.dismissView('{}');
    },
    download() {
      var fileTransfer = new FileTransfer();
      var _this = this;
      fileTransfer.onprogress = function(e) {
        if (e.lengthComputable) {
          console.log(e.loaded);
          const progress = e.loaded / e.total;
          _this.progress = (progress * 100).toFixed(2);
        }
      };
      fileTransfer.download(
        'https://down.52pojie.cn/Tools/NET/dnSpy_For_XP.zip',
        cordova.file.applicationStorageDirectory + 'test.zip',
        function(fileEntry) {
          console.log('Successful download.');
          _this.progress = 100.00;
          Notify('Successful download.');
        },
        function(error) {
          console.log(error);
          Notify(error.source + ' ' + error.target + ' ' + error.code);
        }
      );
    },
    scan() {
      var _this = this;
      window.cordova.plugins.gizscanqrcode.scan(
        {
          'baseColor': '#FF0033',
          'title': '扫描条码或者二维码',
          'barColor': 'FF0033',
          'statusBarColor': 'white',
          'describe': '我是提示语',
          'describeFontSize': '15',
          'describeLineSpacing': '8',
          'describeColor': 'ffffff',
          'borderColor': 'FF0033',
          'borderScale': '0.6',
          'choosePhotoEnable': 'true',
          'choosePhotoBtnTitle': '相册',
          'choosePhotoBtnColor': 'FF0033',
          'flashlightEnable': 'true'
        },
        function(result) {
          console.log(JSON.parse(result));
          var obj = JSON.parse(result);
          var obj1 = JSON.parse(obj.result.replace('\\"', '"'));
          console.log(obj1);
          // Toast.success(obj1.code);

          var msg = {};
          msg.id = _this.id;
          msg.qr = obj1;
          msg.command = 'checkcode';
          _this.$socket.emit('event', msg);

          Toast.loading({
            mask: true,
            message: '正在打卡...'
          });
        },
        function(error) {
          console.log(error);
        }
      );
    },
    scan2() {
      var _this = this;
      window.cordova.plugins.gizscanqrcode.scan(
        {
          'baseColor': '#FF0033',
          'title': '扫描条码或者二维码',
          'barColor': 'FF0033',
          'statusBarColor': 'white',
          'describe': '我是提示语',
          'describeFontSize': '15',
          'describeLineSpacing': '8',
          'describeColor': 'ffffff',
          'borderColor': 'FF0033',
          'borderScale': '0.6',
          'choosePhotoEnable': 'true',
          'choosePhotoBtnTitle': '相册',
          'choosePhotoBtnColor': 'FF0033',
          'flashlightEnable': 'true'
        },
        function(result) {
          console.log(JSON.parse(result));
          var obj = JSON.parse(result);
          var obj1 = JSON.parse(obj.result.replace('\\"', '"'));
          console.log(obj1);
          // Toast.success(obj1.code);

          var msg = {};
          msg.id = _this.id;
          msg.qr = obj1;
          msg.command = 'checkcode';
          _this.$socket.emit('event', msg);

          Toast.loading({
            mask: true,
            message: '正在验证...'
          });
        },
        function(error) {
          console.log(error);
        }
      );
    }
  }
};
</script>

<style>
.van-nav-bar--fixed {
  top: 0;
  left: 0;
  width: 100%;
  position: fixed;
  height: 44px;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  z-index: 999 !important;
}
#mainPanel {
  margin-top: 44px;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}
#atlas {
  min-height: 300px;
  height: 300px;
  width: 100%;
}
</style>
