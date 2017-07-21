var login_err_code;
var sign_up_err_code;

function setLoginErrCode(current_err_code) {
    login_err_code = current_err_code;
}

function setSignUpErrCode(current_err_code) {
    sign_up_err_code = current_err_code;
}

//AngularJS를 이용해 HTML을 제어하기 위한 모듈.
//매개 변수로 관리자 모니터링에 대한 애플리케이션과 사용할 외부 모듈로 이루어진 배열을 전달.
//ngMaterial: Material 디자인에 관한 모듈.
var app = angular.module('oldLoginApp', ['ngMaterial'])
    //해당 모듈에 대한 동작을 결정하기 위한 컨트롤러.
    //매개 변수로 관리자 모니터링에 사용할 컨트롤러와 사용할 변수, 동작에 대한 함수를 전달.
    //$scope: 컨트롤러 내에서 AngularJS에 의해 binding될 변수 및 함수들을 저장.
    //$window: 창 전환에 관한 기능을 이용하기 위한 변수.
    //$mdDialog: AngularJS에 대한 Native Material 디자인이 적용된 다이얼로그를 이용하기 위한 변수.
    .controller('oldLoginController', ['$scope', '$window', '$mdDialog', function($scope, $window, $mdDialog) {
        $scope.loginErrorCode = login_err_code;
        $scope.signUpErrorCode = sign_up_err_code;

        $scope.loginId = "";
        $scope.loginPassword = "";
        $scope.loginIdCode = "";

        $scope.userId = "";
        $scope.userPassword = "";
        $scope.userPasswordCheck = "";
        $scope.userBirthday = "";
        $scope.userEmail = "";

        //크로스 도메인을 위한 함수
        function convertToCorsUrl(url) {
            var protocol = (window.location.protocol === 'http:' ? 'http:' : 'https:');
            return protocol + '//cors-anywhere.herokuapp.com/' + url;
        };

        //매개 변수로 받은 사용자 토큰을 세션에 저장하기 위한 함수.
        function setTokenToSession(tokenValue) {
            if (window.sessionStorage) {
                sessionStorage.setItem('xAuthToken', tokenValue);
            }
        };

        //세션에 저장된 사용자 토큰을 return.
        function getTokenFromSession() {
            if (window.sessionStorage) {
                return sessionStorage.getItem('xAuthToken');
            } else {
                return null;
            }
        };

        //매개 변수로 전달받은 제목과 내용을 이용해 Material 디자인의 경고 다이얼로그 출력.
        $scope.showAlertDialog = function(title, data) {
            $scope.showDialog = function() {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .clickOutsideToClose(true)
                    .title(title)
                    .textContent(data)
                    .ariaLabel('alertDialog')
                    .ok('확인')
                );
            };
            $scope.showDialog();
        };

        //매개 변수로 전달받은 제목과 내용을 이용해 Material 디자인의 경고 다이얼로그 출력 후 새로고침.
        $scope.showAlertDialogWithRefersh = function(title, data) {
            $scope.showDialog = function() {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .clickOutsideToClose(true)
                    .title(title)
                    .textContent(data)
                    .ariaLabel('alertDialog')
                    .ok('확인')
                ).finally(function() {
                    location.reload(false);
                });
            };
            $scope.showDialog();
        };


        //로그인 화면에서 "로그인" 버튼을 눌렀을 때의 동작을 정의하기 위한 함수.
        //올바른 정보를 입력했는지 확인.
        $scope.clickLoginButton = function() {
            if ($scope.loginId == "" || $scope.loginPassword == "") {
                $scope.showAlertDialog("로그인 실패", "ID 또는 비밀번호가 올바르지 않습니다.");
            } else {
                document.forms['login-form'].submit();
                sessionStorage.setItem("currentUserId", $scope.loginId);
            }
        };

        $scope.clickSignUpOkButton = function() {
            if ($scope.userId == "" || $scope.userPassword == "" || $scope.userPasswordCheck == "" || $scope.userBirthday == "" || $scope.userEmail == "") {
                $scope.showAlertDialog("회원가입 실패", "모든 정보를 입력해야 합니다.");
            } else if ($scope.userPassword != $scope.userPasswordCheck) {
                $scope.showAlertDialog("회원가입 실패", "비밀번호가 일치하지 않습니다.");
            } else if (isNaN(parseInt($scope.userBirthday))) {
                $scope.showAlertDialog("회원가입 실패", "생년월일 형식이 올바르지 않습니다.");
            } else {
                document.forms['sign-up-form'].submit();
            }
        }

        $scope.hideLoginWindowFlag = false;
        $scope.hidePolicyWindowFlag = true;
        $scope.hideSignUpWindowFlag = true;

        //로그인 화면에서 "회원가입" 버튼을 눌렀을 때의 동작을 정의하기 위한 함수.
        //이용약관 화면 출력.
        $scope.clickSignUpButton = function() {
            $scope.hideLoginWindowFlag = true;
            $scope.hidePolicyWindowFlag = false;
            $scope.hideSignUpWindowFlag = true;
            $scope.loginId = "";
            $scope.loginPassword = "";
        };

        //이용약관 화면에서 "동의" 버튼을 눌렀을 때의 동작을 정의하기 위한 함수.
        //화원가입 화면 출력.
        $scope.clickAgreeButton = function() {
            $scope.hideLoginWindowFlag = true;
            $scope.hidePolicyWindowFlag = true;
            $scope.hideSignUpWindowFlag = false;
        };

        //이용약관 화면에서 "취소" 버튼을 눌렀을 때의 동작을 수행하기 위한 함수.
        //로그인 화면 출력.
        $scope.clickDisagreeButton = function() {
            $scope.hideLoginWindowFlag = false;
            $scope.hidePolicyWindowFlag = true;
            $scope.hideSignUpWindowFlag = true;
        };

        $scope.login_result = function(err_code) {
            if (err_code == "id incorrect") {
                $scope.showAlertDialog("로그인 실패", "ID가 올바르지 않습니다.");
                sessionStorage.removeItem("currentUserId");
            } else if (err_code == "pwd incorrect") {
                $scope.showAlertDialog("로그인 실패", "비밀번호가 올바르지 않습니다.");
                sessionStorage.removeItem("currentUserId");
            } else if (err_code == "success") {
                $scope.showAlertDialog("로그인 성공", "로그인에 성공하였습니다.");
            }
            setLoginErrCode("none");
        }

        $scope.sign_up_result = function(err_code) {
            if (err_code == "success") {
                $scope.showAlertDialog("회원가입 완료", "회원가입을 완료하였습니다.");
            } else if (err_code == "existed id") {
                $scope.showAlertDialog("회원가입 실패", "이미 존재하는 ID입니다.");
                $scope.clickAgreeButton();
            }
        }

        $scope.login_result($scope.loginErrorCode);
        setLoginErrCode("none");
        $scope.sign_up_result($scope.signUpErrorCode);
        setSignUpErrCode("none");
    }])
    //UnhandledRejection 오류 해결(AngularJS 1.6.x 버그)
    //HTML에서 변수 바인딩 문자를 {{, }}에서 [[, ]]로 교체(Flask Jinja2와 충돌)
    .config(['$qProvider', '$interpolateProvider', function($qProvider, $interpolateProvider) {
        $qProvider.errorOnUnhandledRejections(false);
        $interpolateProvider.startSymbol('[[').endSymbol(']]');
    }]);