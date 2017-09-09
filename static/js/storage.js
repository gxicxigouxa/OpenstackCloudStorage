//AngularJS를 이용해 HTML을 제어하기 위한 모듈.
//매개 변수로 메인 화면에 대한 애플리케이션과 사용할 외부 모듈로 이루어진 배열을 전달.
//ngMaterial: Material 디자인에 관한 모듈.
//ui.grid: 자료들을 나타낼 grid에 관한 모듈.
//ui.grid.selection: ui.grid의 추가 모듈. grid의 특정 열을 선택 가능.
//ui.grid.moveColumns: ui.grid의 추가 모듈. grid의 열 순서를 변경 가능.
//ui.grid.resizeColumns: ui.grid의 추가 모듈. grid의 열 폭을 변경 가능.
var app = angular.module('storageApp', ['ngMaterial', 'ngFileUpload', 'ui.grid', 'ui.grid.selection', 'ui.grid.moveColumns', 'ui.grid.resizeColumns']);
var selectedRow_before = null;
var selected_length = 0;
var new_folder_name = '';
var strarray;
var httpRequest = null;

var token = "";
var adminToken = "";
var containerList = [];
var numberOfObjectList = [];
var sizeList = [];

function setToken(currentToken) {
    token = currentToken;
    setTokenToSession(token);
}

function setAdminToken(currentAdminToken) {
    adminToken = currentAdminToken;
}

function setContainerList(currentList) {
    containerList = currentList;
}

function setNumberOfObjectList(currentList) {
    numberOfObjectList = currentList;
}

function setSizeList(currentList) {
    sizeList = currentList;
}


//오픈스택 API를 사용하기 위한 xmlhttprequest 객체 생성 함수
function getXMLHttpRequest() {
    if (window.ActiveXObject) {
        try {
            return new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e1) {
            try {
                return new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e1) {
                return null;
            }
        }
    } else if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    } else {
        return null;
    }
};

//매개 변수로 받은 사용자 토큰을 세션에 저장하기 위한 함수.
function setTokenToSession(tokenValue) {
    if (window.sessionStorage) {
        sessionStorage.setItem('token', tokenValue);
    }
};

//세션에 저장된 사용자 토큰을 return.
function getTokenFromSession() {
    if (window.sessionStorage) {
        return sessionStorage.getItem('token');
    } else {
        return null;
    }
};
//크로스도메인을 해결하기 위한 함수
function convertToCorsUrl(url) {
    var protocol = (window.location.protocol === 'http:' ? 'http:' : 'https:');
    return protocol + '//cors-anywhere.herokuapp.com/' + url;
};

//매개 변수로 전달받은 파일의 크기(byte 기준)를 SI 접두어에 맞는 형식을 바꾸기 위한 함수.
function formatByte(size) {
    var exp = Math.log(size) / Math.log(1024) | 0;
    var prefix = (exp > 0) ? 'KMGTPEZY' [exp - 1] + 'B' : 'Bytes';
    return (size / Math.pow(1024, exp)).toFixed(1) + /*' ' + */ prefix;
};

//매개 변수로 전달받은 파일의 확장자를 얻기 위한 함수.
function getExtension(fileName) {
    var splitArray = fileName.split(".");
    if (splitArray.length <= 1) {
        return null;
    } else {
        return splitArray[splitArray.length - 1];
    }
};

//매개 변수로 전달받은 파일의 형식을 결정하기 위한 함수.
//getExtension(fileName) 함수를 이용하여 얻은 확장자를 통해 그림, 영상, 음악, 문서, 일반 파일 등으로 결정.
function getFileType(fileName) {
    if (getExtension(fileName)) {
        var extension = getExtension(fileName).toLowerCase();
        if (extension == "jpg" || extension == "png" || extension == "gif" || extension == "bmp") {
            return "그림";
        } else if (extension == "avi" || extension == "mp4" || extension == "mkv" || extension == "wmv") {
            return "영상";
        } else if (extension == "mp3" || extension == "ogg" || extension == "wav" || extension == "flac") {
            return "음악";
        } else if (extension == "doc" || extension == "docx" || extension == "txt" || extension == "hwp" || extension == "pdf") {
            return "문서";
        } else {
            return "파일";
        }
    }
};

//매개 변수로 공유하고자 하는 사용자의 프로젝트 ID를 전달받아 공유 목록에 추가하기 위한 함수.
function addProjectIdRow(newProjectId) {
    var sharingUserIdCodeList = angular.element(document.querySelector("#sharingUserIdCodeList"));
    sharingUserIdCodeList.append("<li class='mdl-menu__item'>" + newProjectId + "</li>");
};

//공유 목록을 초기화하기 위한 함수.
function clearProjectIdRow() {
    var sharingUserIdCodeList = angular.element(document.querySelector("#sharingUserIdCodeList"));
    while (sharingUserIdCodeList.firstChild) {
        sharingUserIdCodeList.removeChild(sharingUserIdCodeList.firstChild);
    }
};

var currentUserId;
var currentUserPassword;
var currentUserToken;
//해당 모듈에 대한 동작을 결정하기 위한 컨트롤러.
//매개 변수로 메인 화면에 사용할 컨트롤러와 사용할 변수, 동작에 대한 함수를 전달.
//$scope: 컨트롤러 내에서 AngularJS에 의해 binding될 변수 및 함수들을 저장.
//$mdDialog: AngularJS에 대한 Native Material 디자인이 적용된 다이얼로그를 이용하기 위한 변수.
//$filter: grid에서 찾기 기능을 이용하기 위한 변수.
//$window: 창 전환에 관한 기능을 이용하기 위한 변수.
app.controller('storageController', ['$scope', '$mdDialog', '$filter', '$window', '$http', 'Upload', function($scope, $mdDialog, $filter, $window, $http, Upload) {
    console.log("token: " + token);
    //console.log("storageListString: " + storageListString);
    console.log("adminToken: " + adminToken);
    console.log("containerList: ");
    console.log(containerList);
    console.log(numberOfObjectList);
    console.log(sizeList);
    //$scope.storageList = storageListString.split("/");
    //console.log($scope.storageList);
    $scope.currentUserId = sessionStorage.getItem("currentUserId");
    $scope.currentUserPassword = sessionStorage.getItem("currentUserPassword");
    $scope.currentUserToken = getTokenFromSession();
    currentUserId = $scope.currentUserId;
    currentUserPassword = $scope.currentUserPassword;
    currentUserToken = $scope.currentUserToken;
    $scope.sharingUserList = [];
    $scope.selectedSharingUser = "";

    var usedbyte = new Array();
    var Data = new Array();
    var numberOfObj = new Array();
    nameArray = new Array();
    makeDateArray = new Array();
    numberOfObjectArray = new Array();
    sizeArray = new Array();
    var p;
    var strarray;
    //로그아웃 시 로그인 화면으로 돌아가기 위한 함수.
    $scope.clickLogout = function() {
        $window.open("/login", "_self");
    };

    //매개 변수로 이벤트를 전달해 공유 목록에 있는 사용자 중 선택한 사용자의 스토리지로 전환하기 위한 함수.
    $scope.changeStorageBySelectedUser = function($scope) {
        /*
        sessionStorage.setItem("currentFolderId", event.target.innerHTML);
        var idData;
        var temp;
        xhr = getXMLHttpRequest(); //토큰을 받아오기 위한 객체
        xhr.open("POST", "http://164.125.70.14:5000/v2.0/tokens", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function(e) {
            var jsontext = this.response;
            var jsonData = jsontext.split(",");
            idData = jsonData[2].split(":");
            var T = idData[1].substring(2, idData[1].length - 1);
            setTokenToSession(T);
            location.reload(false);
        };
        xhr.send(JSON.stringify({ "auth": { "tenantName": sessionStorage.getItem("currentFolderId"), "passwordCredentials": { "username": sessionStorage.getItem("currentUserId"), "password": sessionStorage.getItem("currentUserPassword") } } }));
        */
    };

    $scope.getSharingUserList = function() {
        $http({
            method: "POST",
            url: '/requestsharinguserlist',
            data: {
                "currentUserId": currentUserId,
                "currentUserToken": currentUserToken,
                "forSharingUserId": $scope.forSharingUserId
            }
        }).then(function successCallback(response) {
            console.log("success: ");
            console.log(response);
            /*
            clearProjectIdRow();
            for (var i = 0; i < response.data.result.length; ++i) {
                addProjectIdRow(response.data.result[i]);
            }
            */
            $scope.sharingUserList = response.data.result;
            //$scope.hide();
        }, function errorCallback(response) {
            console.log("error: " + response);
        });
    };

    $scope.getSharingUserList();

    $scope.selectSharingUser = function() {
        console.log($scope.selectedSharingUser);
        $http({
            method: "POST",
            url: '/requestchangestorage',
            data: {
                "sharingUserId": $scope.selectedSharingUser
            }
        }).then(function successCallback(response) {
            console.log("success: ");
            console.log(response);
            location.reload(false);
        }, function errorCallback(response) {
            console.log("error: " + response);
        });
    };

    $scope.selectedFolder = [];
    var selectedFolder = selectedFolder;
    var selectedFolderName;
    $scope.gridOptions = {
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        enableColumnMenus: false
    };
    var tmpl = '<div ng-if="!row.entity.editable">{{COL_FIELD}}</div><div ng-if="row.entity.editable"><input ng-model="MODEL_COL_FIELD"></div>';
    $scope.gridOptions.columnDefs = [
        { name: 'name', displayName: '폴더 이름', headerCellClass: 'header', cellClass: 'row', cellTemplate: tmpl },
        { name: 'numberOfObject', displayName: '파일 갯수', allowCellFocus: true, headerCellClass: 'header', cellClass: 'row' },
        { name: 'size', displayName: '크기', headerCellClass: 'header', cellClass: 'row' }
    ];
    $scope.gridOptions.multiSelect = false;
    $scope.gridOptions.modifierKeysToMultiSelect = false;
    $scope.gridOptions.noUnselect = true;
    $scope.gridOptions.data = [];

    $scope.addExistedStorage = function() {
        for (var i = 0; i < containerList.length; ++i) {
            if (containerList[i] != "malware" && containerList[i] != "textcompare") {
                $scope.gridOptions.data.push({ name: containerList[i], numberOfObject: numberOfObjectList[i], size: formatByte(parseInt(sizeList[i])) });
            }
        }
    }
    $scope.addExistedStorage();

    //새로운 폴더를 생성하여 grid에 출력하기 위한 함수.
    function new_folder() {
        if (new_folder_name == '') return;
        $scope.gridOptions.data.push({ name: new_folder_name, makeDate: "빈 폴더", numberOfObject: "0", size: formatByte(0) });
    };

    //회원에 대한 권한을 표현하기 위한 변수.
    //admin: 관리자.
    //Member: 사용자.
    //nullRole: 권한 없음(초기 상태).
    var roleId = {
        admin: "89799aafdaed465a8ec2bd19973696ff",
        Member: "8d57cf40791a48c59bbeae6a4cd72bc7",
        nullRole: "9fe2ff9ee4384b1894a90878d3e92bab"
    };

    //매개 변수로 이벤트를 전달해 파일 공유에 대한 다이얼로그를 출력하기 위한 함수.
    $scope.showFileSharingDialog = function(event) {
        $mdDialog.show({
            controller: fileSharingDialogController,
            templateUrl: 'dialog/file_sharing_dialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
        });
    };

    //매개 변수로 AngularJS에 대한 전역 변수를 전달해 파일 공유 다이얼로그의 컨트롤러를 구성하기 위한 함수.
    function fileSharingDialogController($scope) {
        $scope.forSharingUserId = "";
        var jsontext;
        //공유하고자 하는 사용자의 ID를 입력한 후 "공유" 버튼을 눌렀을 때의 동작을 수행하기 위한 함수.
        //입력한 사용자가 공유 목록에 나타나도록 구성.
        $scope.clickSharingButton = function() {
            /*
            xhr1 = getXMLHttpRequest(); //데이터 베이스 서버에서 공유할 상대 정보를 가져오기 위한 객체
            xhr2 = getXMLHttpRequest(); //데이터 베이스 서버에서 공유할 상대 정보를 삭제하기 위한 객체
            xhr3 = getXMLHttpRequest(); //데이터 베이스 서버에서 공유할 상대 정보를 갱신하기 위한 객체
            xhr4 = getXMLHttpRequest(); //오픈스택 서버에서 공유할 상대 프로젝트 ID를 추가 하기 위한 객체
            xhr5 = getXMLHttpRequest(); //오픈스택 서버에서 공유할 상대의 권한을 바꾸기 위한 객체
            xhr6 = getXMLHttpRequest(); //오픈스택 서버에서 공유할 상대의 권한을 바꾸기 위한 객체
            xhr1.open("GET", convertToCorsUrl("http://164.125.70.21:3000/member/" + $scope.forSharingUserId), true);
            xhr2.open("DELETE", convertToCorsUrl("http://164.125.70.21:3000/member/" + $scope.forSharingUserId), true);
            xhr3.open("POST", convertToCorsUrl("http://164.125.70.21:3000/member"), true);
            xhr1.setRequestHeader("Content-Type", "application/json");
            xhr2.setRequestHeader("Content-Type", "application/json");
            xhr3.setRequestHeader("Content-Type", "application/json");

            xhr1.onload = function(e) {
                jsontext = this.response;
                var convertedJson = JSON.parse(jsontext);
                convertedJson[0].mem_project_id = convertedJson[0].mem_project_id + "," + currentUserId;
                xhr2.send(null);
                xhr3.send(JSON.stringify(convertedJson[0]));
                xhr4.open("PUT", convertToCorsUrl("http://164.125.70.14:35357/v2.0/users/" + convertedJson[0].mem_id), true);
                xhr4.setRequestHeader("Content-Type", "application/json");
                xhr4.setRequestHeader("x-auth-token", sessionStorage.getItem("currentManagerToken"));
                xhr4.send(JSON.stringify({ "user": { "tenantId": currentUserId } }));
                xhr5.open("DELETE", "http://164.125.70.14:35357/v3/projects/" + currentUserId + "/users/" + convertedJson[0].mem_id + "/roles/" + roleId.nullRole, true);
                xhr6.open("PUT", "http://164.125.70.14:35357/v3/projects/" + currentUserId + "/users/" + convertedJson[0].mem_id + "/roles/" + roleId.Member, true);
                xhr5.setRequestHeader("Content-Type", "application/json");
                xhr5.setRequestHeader("x-auth-token", sessionStorage.getItem("currentManagerToken"));
                xhr6.setRequestHeader("Content-Type", "application/json");
                xhr6.setRequestHeader("x-auth-token", sessionStorage.getItem("currentManagerToken"));
                xhr5.send();
                xhr6.send();
                var memberIdArray = convertedJson[0].mem_project_id.split(",");
                clearProjectIdRow();
                for (var i = 0; i < memberIdArray.length; ++i) {
                    addProjectIdRow(memberIdArray[i]);
                }
            };
            xhr1.send(null);
            */
            $http({
                method: "POST",
                url: '/requestfilesharing',
                data: {
                    "currentUserId": currentUserId,
                    "currentUserToken": currentUserToken,
                    "forSharingUserId": $scope.forSharingUserId
                }
            }).then(function successCallback(response) {
                console.log("success: " + response);
                //$scope.hide();
            }, function errorCallback(response) {
                console.log("error: " + response);
            });
        };

        //dialog 닫기.
        $scope.hide = function() {
            $mdDialog.hide();
        };

        //dialog 취소.
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
    };

    //매개 변수로 이벤트를 전달해 삭제에 대한 다이얼로그를 출력하기 위한 함수.
    $scope.showDeleteDialog = function(event) {
        $scope.showAlertDialog = function(event) {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('삭제 안내')
                .textContent('삭제하고자 하는 폴더를 선택하고 delete키를 눌러주세요.')
                .ariaLabel('alertDialog')
                .ok('확인')
                .targetEvent(event)
            );
        };

        $scope.showAlertDialog(event);
    };

    /*
    TODO. 새 폴더를 생성하고 바로 gridOptions에 생성한 폴더를 추가하려고 하지만 문제 발생.
    아마 전달되는 gridOption이 db를 통해 폴더를 불러오기 전에 바로 binding되어 data가 없는 상태이기 때문으로 보임.
    가장 좋은 해결 방안은 폴더를 불러온 후 binding하는 것이지만 불가능한 것으로 보임.
    혹은 폴더 확인 버튼을 가져와 이 부분에 대해 angulerjs가 아닌 기존 javascript의 listener를 추가하는 방법을 사용할 수 있을 것 같음.
    원래 방법이 이러했으나 modal을 불러오지 못해 디자인이 깨짐.
    지금은 임시방편으로 폴더가 추가되면 새로고침을 하는 방법으로 둠(매우 angulerjs스럽지 못한 방법).
     */
    //매개 변수로 이벤트를 전달해 컨테이너 생성에 대한 다이얼로그를 출력하기 위한 함수.
    $scope.showCreateContainerDialog = function(event) {
        $mdDialog.show({
            controller: createContainerDialogController,
            templateUrl: 'dialog/create_container_dialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: false,
            escapeToClose: false,
            scope: $scope,
            preserveScope: true
        });
    };

    //매개 변수로 AngularJS에 대한 전역 변수를 전달해 컨테이너 생성 다이얼로그의 컨트롤러를 구성하기 위한 함수.
    function createContainerDialogController($scope) {
        $scope.newContainerName = '';
        $scope.isDisableOkButton = true;
        $scope.okButtonString = "확인";
        $scope.onChangedContainerNameInput = function() {
            if ($scope.newContainerName == '' || $scope.newContainerName == undefined) {
                $scope.okButtonString = "확인";
                $scope.isDisableOkButton = true;
            } else if (containerList.indexOf($scope.newContainerName) != -1) {
                $scope.okButtonString = "이미 사용중인 이름";
                $scope.isDisableOkButton = true;
            } else {
                $scope.okButtonString = "확인";
                $scope.isDisableOkButton = false;
            }
        }
        $scope.changeWaitingStatus = function(waitingStatus) {
            if (waitingStatus) {
                $scope.isShowWaitSignal = true;
                $scope.isDisableCancelButton = true;
                $scope.isDisableOkButton = true;
                $scope.isDisabledContainerNameInput = true;
            } else {
                $scope.isShowWaitSignal = false;
                $scope.isDisableCancelButton = false;
                $scope.isDisabledContainerNameInput = false;
            }
        };
        $scope.changeWaitingStatus(false);

        //dialog 닫기.
        $scope.hide = function() {
            $mdDialog.hide();
        };

        //dialog 취소.
        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        //만들고자 하는 컨테이너의 이름을 입력하고 "확인" 버튼을 눌렀을 때의 동작을 수행하기 위한 함수.
        $scope.createNewContainer = function() {
            $scope.changeWaitingStatus(true);
            $http({
                method: "POST",
                url: "/createcontainer",
                data: {
                    "newContainerName": $scope.newContainerName,
                    "currentUserId": currentUserId,
                    "currentUserToken": currentUserToken
                }
            }).then(function successCallback(response) {
                console.log("success: " + response);
                $scope.gridOptions.data.push({ name: $scope.newContainerName, makeDate: "(만든 날짜)", numberOfObject: "(내부 파일 갯수)", size: "(스토리지 크기)" });
                containerList.push($scope.newContainerName);
                $scope.hide();
            }, function errorCallback(response) {
                console.log("error: " + response);
            });
        };


    };

    //폴더 목록에서 특정 폴더를 선택하여 저장된 파일의 내용을 보여주는 다이얼로그를 출력하기 위한 함수.
    $scope.showFolderDialog = function(event) {
        //templateUrl로 지정된 외부 html 파일을 dialog로 출력하고 이를 위한 Controller는
        //controller로 지정된 함수를 사용.
        $mdDialog.show({
            controller: folderDialogController,
            templateUrl: 'dialog/folder_dialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
        });
    };

    //매개 변수로 AngularJS에 대한 전역 변수, 다이얼로그 변수, Toast 메시지를 출력하기 위한 변수를 전달해
    //폴더 다이얼로그의 컨트롤러를 구성하기 위한 함수.
    function folderDialogController($scope, $mdDialog, $mdToast) {
        $scope.containerName = selectedFolderName;
        $scope.currentPath = $scope.containerName;
        $scope.selectedFolder;
        $scope.lastSelectedItem;
        $scope.isAutoClassification = false;
        $scope.isDisableMalwareTestButton = false;
        $scope.malwareTestButtonMessage = "악성코드 검사 후 업로드";
        var existFiles = [];
        $scope.selectedExistFile = [];
        $scope.existFilesGridData = {
            //마우스로 grid에 보이는 데이터 선택 가능.
            enableRowSelection: true,
            //데이터 선택을 위해 따로 앞쪽에 checkbox 만들지 않음.
            enableRowHeaderSelection: false,
            //검색 가능.
            enableFiltering: true,
            //표시할 데이터.
            data: 'existFilesGridData.data',
            //데이터 열 정의.
            columnDefs: [{
                field: 'name',
                displayName: '이름'
            }, {
                field: 'lastUpdate',
                displayName: '생성 날짜'
            }, {
                field: 'size',
                displayName: '크기'
            }, {
                field: 'format',
                displayName: '형식'
            }]
        };
        //여러 데이터 선택 불가.
        $scope.existFilesGridData.multiSelect = false;
        //Ctrl, Shift를 누른 상태에서는 그에 맞는 다중 선택 불가.
        $scope.existFilesGridData.modifierKeysToMultiSelect = false;
        //한번 더 선택하면 선택 취소 불가.
        $scope.existFilesGridData.noUnselect = false;
        //grid에 대한 데이터 초기화.
        $scope.existFilesGridData.data = [];
        //grid에 대한 callback 함수를 정의.
        //특정 열이 선택됐을 때 그 열을 저장하도록 구성하여 선택한 파일 또는 폴더 구분 가능.
        $scope.existFilesGridData.onRegisterApi = function(gridApi) {
            $scope.gridApi2 = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function(rows) {
                $scope.selectedExistFile = gridApi.selection.getSelectedRows();
                if ($scope.selectedExistFile.length != 0) {
                    $scope.lastSelectedItem = $scope.selectedExistFile[$scope.selectedExistFile.length - 1];
                    if ($scope.selectedExistFile[$scope.selectedExistFile.length - 1].format == "파일") {
                        console.log("선택된 파일의 이름: " + $scope.selectedExistFile[$scope.selectedExistFile.length - 1].name);
                    } else if ($scope.selectedExistFile[$scope.selectedExistFile.length - 1].format == "폴더") {
                        console.log("선택된 폴더의 이름: " + $scope.selectedExistFile[$scope.selectedExistFile.length - 1].name);
                        $scope.selectedFolder = $scope.selectedExistFile[$scope.selectedExistFile.length - 1];
                    } else {
                        console.log("선택된 것: ");
                        console.log($scope.selectedExistFile);
                    }
                }
            });
            gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows) {
                $scope.selectedExistFile = gridApi.selection.getSelectedRows();
            });
        };

        $scope.changeFolder = function() {
            console.log($scope.selectedFolder);
            console.log($scope.selectedFolder.name);
            console.log($scope.selectedFolder.lastUpdate);
            console.log($scope.selectedFolder.size);
            if ($scope.selectedFolder.name == ("(이전 폴더)") && $scope.selectedFolder.lastUpdate == ".." && $scope.selectedFolder.size == "..") {
                console.log("이전 폴더로 이동");
                $scope.currentPath = $scope.currentPath.substring(0, $scope.currentPath.lastIndexOf("/"));
            } else {
                console.log("그냥 폴더로 이동")
                $scope.currentPath += ("/" + $scope.selectedFolder.name);
            }
            console.log("다음 요청할 폴더 경로: " + $scope.currentPath);
            $scope.existFilesGridData.data = [];
            console.log("파일 목록 요청 시작");
            if ($scope.currentPath == $scope.containerName) {
                $http({
                    method: "POST",
                    url: "/requestfilelist",
                    data: {
                        "currentUserId": currentUserId,
                        "currentUserToken": currentUserToken,
                        "currentFolderPath": $scope.currentPath
                    }
                }).then(function successCallback(response) {
                    console.log("success: ");
                    console.log("받은 데이터:");
                    console.log(response);
                    if ($scope.currentPath != $scope.containerName) {
                        $scope.existFilesGridData.data.push({
                            "name": "(이전 폴더)",
                            "lastUpdate": "..",
                            "size": "..",
                            "format": "폴더"
                        });
                    }
                    for (var i = 0; i < response.data.folders.length; ++i) {
                        $scope.existFilesGridData.data.push(response.data.folders[i]);
                    }
                    for (var i = 0; i < response.data.files.length; ++i) {
                        $scope.existFilesGridData.data.push(response.data.files[i]);
                    }
                    console.log("현재 경로: " + $scope.currentPath);
                }, function errorCallback(response) {
                    console.log("error: " + response);
                });
                console.log("파일 목록 요청 끝");
            } else {
                $http({
                    method: "POST",
                    url: "/requestinnerfilelist",
                    data: {
                        "currentUserId": currentUserId,
                        "currentUserToken": currentUserToken,
                        "currentFolderPath": $scope.currentPath
                    }
                }).then(function successCallback(response) {
                    console.log("success: ");
                    console.log("받은 데이터:");
                    console.log(response);
                    if ($scope.currentPath != $scope.containerName) {
                        $scope.existFilesGridData.data.push({
                            "name": "(이전 폴더)",
                            "lastUpdate": "..",
                            "size": "..",
                            "format": "폴더"
                        });
                    }
                    for (var i = 0; i < response.data.folders.length; ++i) {
                        $scope.existFilesGridData.data.push(response.data.folders[i]);
                    }
                    for (var i = 0; i < response.data.files.length; ++i) {
                        $scope.existFilesGridData.data.push(response.data.files[i]);
                    }
                    console.log("현재 경로: " + $scope.currentPath);
                }, function errorCallback(response) {
                    console.log("error: " + response);
                });
                console.log("파일 목록 요청 끝");
            }
        };

        //메인 화면에서 매개 변수로 전달하는 특정 폴더를 더블클릭할 때의 동작을 결정하기 위한 함수.
        //해당 폴더에 대한 다이얼로그가 나타나도록 구성.
        $scope.onDblClickRow = function(row) {
            console.log("무언가 더블클릭됨");
            console.log($scope.lastSelectedItem);
            console.log($scope.selectedFolder);
            if ($scope.lastSelectedItem == $scope.selectedFolder) {
                console.log("폴더 " + $scope.selectedFolder.name + "이(가) 더블클릭됨.");
                $scope.changeFolder();
            }
        };
        console.log("파일 목록 요청 시작");
        $http({
            method: "POST",
            url: "/requestfilelist",
            data: {
                "currentUserId": currentUserId,
                "currentUserToken": currentUserToken,
                "currentFolderPath": $scope.currentPath
            }
        }).then(function successCallback(response) {
            console.log("success: ");
            console.log("받은 데이터:");
            console.log(response);

            for (var i = 0; i < response.data.folders.length; ++i) {
                $scope.existFilesGridData.data.push(response.data.folders[i]);
            }
            for (var i = 0; i < response.data.files.length; ++i) {
                $scope.existFilesGridData.data.push(response.data.files[i]);
            }
            console.log("현재 경로: " + selectedFolderName);
        }, function errorCallback(response) {
            console.log("error: " + response);
        });
        console.log("파일 목록 요청 끝");

        //파일 grid에 대해 선택된 열이 없는지를 판단.        
        $scope.isNotSelectedExistFiles = function() {
            if ($scope.selectedExistFile.length == 0) {
                return true;
            } else {
                return false;
            }
        };

        //dialog 닫기.
        $scope.hide = function() {
            $mdDialog.hide();
        };

        //dialog 취소.
        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        //새로 업로드하고자 하는 파일을 지정할 경우 파일 grid에 추가하고 실제 서버에 저장하기 위한 함수.
        $scope.fileChanged = function(element) {
            //선택된 파일들.
            var selectedFiles = element.files;
            //선택된 파일의 갯수.
            var numberOfSelectedFiles = selectedFiles.length;
            //파일의 갯수만큼 출력할 grid의 형식에 맞게 데이터 추가하고 업로드할 파일에 추가.
            for (var i = 0; i < numberOfSelectedFiles; ++i) {
                var currentFileInfo = {
                    format: getFileType(selectedFiles[i].name),
                    name: selectedFiles[i].name,
                    lastUpdate: selectedFiles[i].lastModifiedDate,
                    size: formatByte(selectedFiles[i].size)
                };
                $scope.existFilesGridData.data.push(currentFileInfo);
            }
            //grid 갱신.
            $scope.$apply();
            $scope.uploadSelectedFiles();
        };

        //업로드하고자 하는 파일을 실제로 서버에 저장하기 위한 함수.
        //$scope.fileChanged(element) 내에서 호출.
        $scope.uploadSelectedFiles = function() {
            /*
            var obj;
            var fileName;
            var extName;
            // 파일을 업로드 한다.
            var uploadFile = document.getElementById("fileInputButton")
            obj = document.actFrm.upFile;
            if (obj.value != "") {
                var pathHeader = obj.value.lastIndexOf("\\");
                var pathMiddle = obj.value.lastIndexOf(".");
                var pathEnd = obj.value.length;
                fileName = obj.value.substring(pathHeader + 1, pathMiddle);
                extName = obj.value.substring(pathMiddle + 1, pathEnd);
            }
            var xhr = new XMLHttpRequest(); //파일을 업로드 하기 위한 객체
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) { //4:complete state 200 : 이상없음
                }
            };

            //맨마지막에 자신이 업로드할때 올리고자 할 파일 이름 삽입
            xhr.open("PUT", convertToCorsUrl("http://164.125.70.14:8505/v1/AUTH_" + sessionStorage.getItem("currentFolderId") + "/" + $scope.folderName + "/" + fileName + "." + extName), true);
            xhr.setRequestHeader("X-File-Name", encodeURIComponent(uploadFile.files[0].name));
            //토큰 갱신될때마다 계속 바꿔주기 
            xhr.setRequestHeader("x-auth-token", getTokenFromSession());
            xhr.setRequestHeader("content-type", "text/html");
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.send(uploadFile.files[0]);
            $scope.$apply();
            $scope.showUploadCompletedToast();
            */
            //TODO.
            var obj;
            var fileName;
            var extName;
            // 파일을 업로드 한다.
            var uploadFile = document.getElementById("fileInputButton")
            obj = document.actFrm.upFile;
            if (obj.value != "") {
                var pathHeader = obj.value.lastIndexOf("\\");
                var pathMiddle = obj.value.lastIndexOf(".");
                var pathEnd = obj.value.length;
                fileName = obj.value.substring(pathHeader + 1, pathMiddle);
                extName = obj.value.substring(pathMiddle + 1, pathEnd);
            }
            console.log("uploadFile.files:");
            console.log(uploadFile.files);

            if (!$scope.isAutoClassification) {
                console.log("파일 업로드 요청 시작(일반)");
                Upload.upload({
                    url: "/requestfileupload",
                    file: uploadFile.files[0],
                    data: {
                        "currentUserId": currentUserId,
                        "currentUserToken": currentUserToken,
                        "currentFolderPath": $scope.currentPath
                    }
                }).then(function successCallback(response) {
                    console.log("success: ");
                    console.log("받은 데이터:");
                    console.log(response);
                    /*
                    $scope.existFilesGridData.data.push({
                        "name": uploadFile.files[0].name,
                        "lastUpdate": "만든 날짜(파일)",
                        "size": "파일의 크기",
                        "format": "파일"
                    });
                    */
                }, function errorCallback(response) {
                    console.log("error: ");
                    console.log(response);
                });
                console.log("파일 업로드 요청 끝(일반)");
            } else {
                console.log("파일 업로드 요청 시작(자동분류)");
                Upload.upload({
                    url: "/textcompare",
                    file: uploadFile.files[0],
                    data: {
                        "currentUserId": currentUserId,
                        "currentUserToken": currentUserToken,
                        "currentFolderPath": $scope.currentPath
                    }
                }).then(function successCallback(response) {
                    console.log("success: ");
                    console.log("받은 데이터:");
                    console.log(response);
                }, function errorCallback(response) {
                    console.log("error: ");
                    console.log(response);
                });
                console.log("파일 업로드 요청 끝(자동분류)");
            }

        };

        $scope.malwareTest = function(element) {
            //선택된 파일들.
            var selectedFiles = element.files;
            //선택된 파일의 갯수.
            var numberOfSelectedFiles = selectedFiles.length;
            console.log("악성코드 테스트 요청 시작");
            $scope.malwareTestButtonMessage = "검사중...";
            $scope.isDisableMalwareTestButton = true;
            Upload.upload({
                url: "/malwaretest",
                file: selectedFiles[0],
                data: {
                    "currentUserId": currentUserId,
                    "currentUserToken": currentUserToken,
                    "currentFolderPath": $scope.currentPath
                }
            }).then(function successCallback(response) {
                console.log("success: ");
                console.log("받은 데이터:");
                console.log(response);
                $scope.showAlertDialog = function(title, data) {
                    $scope.showDialog = function() {
                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .multiple(true)
                            .clickOutsideToClose(true)
                            .title(title)
                            .textContent(data)
                            .ariaLabel('alertDialog')
                            .ok('확인')
                        );
                    };
                    $scope.showDialog();
                };
                if (response.data == "Scan request fail") {
                    $scope.showAlertDialog("분석 실패", "분석 요청 실패");
                } else if (response.data == "Scan data input fail") {
                    $scope.showAlertDialog("분석 실패", "분석 요청 전송 실패");
                } else if (response.data == "Lots of requests") {
                    $scope.showAlertDialog("분석 실패", "과도한 요청으로 인한 실패");
                } else if (response.data == "Report request fail") {
                    $scope.showAlertDialog("분석 실패", "분석 결과 요청 실패");
                } else if (response.data == "Report data input fail"	) {
                    $scope.showAlertDialog("분석 실패", "분석 결과 전송 실패");
                } else if (response.data == "Virus detected") {
                    $scope.showAlertDialog("악성코드 검출됨", "악성코드가 검출되었습니다. 악성 파일 목록에 업로드합니다.");
                    console.log("파일 업로드 요청 시작");
                    Upload.upload({
                        url: "/requestfileupload",
                        file: selectedFiles[0],
                        data: {
                            "currentUserId": currentUserId,
                            "currentUserToken": currentUserToken,
                            "currentFolderPath": "malware"
                        }
                    }).then(function successCallback(response) {
                        console.log("success: ");
                        console.log("받은 데이터:");
                        console.log(response);
                    }, function errorCallback(response) {
                        console.log("error: ");
                        console.log(response);
                    });
                    console.log("파일 업로드 요청 끝");
                } else if (response.data == "Virus not detected") {
                    $scope.showAlertDialog("악성코드 검출되지 않음", "악성코드가 검출되지 않았습니다. 현재 경로에 업로드합니다.");
                    console.log("파일 업로드 요청 시작");
                    Upload.upload({
                        url: "/requestfileupload",
                        file: selectedFiles[0],
                        data: {
                            "currentUserId": currentUserId,
                            "currentUserToken": currentUserToken,
                            "currentFolderPath": $scope.currentPath
                        }
                    }).then(function successCallback(response) {
                        console.log("success: ");
                        console.log("받은 데이터:");
                        console.log(response);
                        $scope.existFilesGridData.data.push({
                            "name": selectedFiles[0].name,
                            "lastUpdate": "만든 날짜(파일)",
                            "size": "파일의 크기",
                            "format": "파일"
                        });
                    }, function errorCallback(response) {
                        console.log("error: ");
                        console.log(response);
                    });
                    console.log("파일 업로드 요청 끝");
                } else {
                    $scope.showAlertDialog("분석 실패", "알 수 없는 결과");
                }
                $scope.malwareTestButtonMessage = "악성코드 검사";
                $scope.isDisableMalwareTestButton = false;
            }, function errorCallback(response) {
                console.log("error: ");
                console.log(response);
                alert("오류 발생");
                $scope.malwareTestButtonMessage = "악성코드 검사";
                $scope.isDisableMalwareTestButton = false;
            });
            console.log("악성코드 테스트 요청 끝");
        }

        //파일 grid에서 다운로드하고자 하는 파일을 실제로 로컬 드라이브에 저장하기 위한 함수.
        $scope.downloadSelectedFile = function() {
            /*
            var xhr = getXMLHttpRequest(); //오픈스택 서버에서 로컬 드라이브로 파일을 저장하기 위한 객체
            $scope.gridApi2.selection.getSelectedRows();
            xhr.open("GET", convertToCorsUrl("http://164.125.70.14:8505/v1/AUTH_" + sessionStorage.getItem("currentFolderId") + "/" + $scope.folderName + "/" + $scope.selectedExistFile[0].name), true);
            xhr.setRequestHeader("x-auth-token", getTokenFromSession());
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
            xhr.responseType = "arraybuffer";
            xhr.onload = function(e) {
                var arrayBufferView = new Uint8Array(this.response);
                var blob = new Blob([arrayBufferView], { type: "image/jpeg" });
                var urlCreator = window.URL || window.webkitURL;

                if (window.navigator.msSaveOrOpenBlob)
                    window.navigator.msSaveOrOpenBlob(blob, $scope.selectedExistFile[0].name);
                else {
                    var a = window.document.createElement("a");
                    a.href = window.URL.createObjectURL(blob, { type: "image/jpeg" });
                    a.download = $scope.selectedExistFile[0].name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            };
            xhr.send();
            */
            //TODO. 테스트 필요.
            console.log("파일 다운로드 요청 시작");
            //TODO.
            
            $http({
                method: "POST",
                url: "/requestfiledownload",
                data: {
                    "currentUserId": currentUserId,
                    "currentUserToken": currentUserToken,
                    "currentFolderPath": $scope.currentPath,
                    "currentFileName": $scope.selectedExistFile[0].name
                },
                responseType: 'arraybuffer'
            })
            /*
            $http({
                method: "GET",
                url: 'http://183.103.47.19:8080/v1/AUTH_'+ currentUserId + "/" + $scope.currentPath + "/" + $scope.selectedExistFile[0].name,
                headers: {
                    "x-auth-token": currentUserToken,
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                }
            })
            */
            .then(function successCallback(response) {
                console.log("success: ");
                console.log("받은 데이터:");
                console.log(response);
                var arrayBufferView = new Uint8Array(response.data);
                var blob = new Blob([arrayBufferView], { type: "text/plain" });
                var urlCreator = window.URL || window.webkitURL;
                
                if (window.navigator.msSaveOrOpenBlob)
                    window.navigator.msSaveOrOpenBlob(blob, $scope.selectedExistFile[0].name);
                else {
                    var a = window.document.createElement("a");
                    a.href = window.URL.createObjectURL(blob, { type: "image/jpeg" });
                    a.download = $scope.selectedExistFile[0].name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
                
            }, function errorCallback(response) {
                console.log("error: " + response);
            });
            console.log("파일 다운로드 요청 끝");
        };

        //파일 grid에서 삭제하고자 하는 파일을 실제 서버에서 제거하기 위한 함수.
        $scope.deleteFile = function() {
            console.log("파일 삭제 요청 시작");
            $http({
                method: "POST",
                url: "/requestfiledelete",
                data: {
                    "currentUserId": currentUserId,
                    "currentUserToken": currentUserToken,
                    "currentFolderPath": $scope.currentPath,
                    "currentFileName": $scope.selectedExistFile[0].name
                }
            }).then(function successCallback(response) {
                console.log("success: ");
                console.log("받은 데이터:");
                angular.forEach($scope.gridApi2.selection.getSelectedRows(), function(data, index) {
                    $scope.existFilesGridData.data.splice($scope.existFilesGridData.data.lastIndexOf(data), 1);
                });
                $scope.gridApi2.selection.clearSelectedRows();
            }, function errorCallback(response) {
                console.log("error: " + response);
            });
            console.log("삭제 요청 끝");
            /*
            var xhr = new XMLHttpRequest(); //파일을 삭제하기 위한 객체
            //맨마지막에 자신이 업로드할때 올리고자 할 파일 이름 삽입
            xhr.open("DELETE", convertToCorsUrl("http://164.125.70.14:8505/v1/AUTH_" + sessionStorage.getItem("currentFolderId") + "/" + selectedFolderName + "/" + $scope.selectedExistFile[0].name), true);
            xhr.setRequestHeader("x-auth-token", getTokenFromSession()); //토큰 갱신될때마다 계속 바꿔주기 
            xhr.setRequestHeader("content-type", "text/html");
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.send();
            */
            angular.forEach($scope.gridApi2.selection.getSelectedRows(), function(data, index) {
                $scope.existFilesGridData.data.splice($scope.existFilesGridData.data.lastIndexOf(data), 1);
            });
            $scope.gridApi2.selection.clearSelectedRows();

        };

        //파일 grid에서 선택한 파일을 목록에서 제거하기 위한 함수.
        $scope.removeSelectedFile = function() {
            //선택한 하나 또는 여러 개의 데이터에 대해 grid에서 제거 후 업로드할 파일에서 삭제.
            angular.forEach($scope.gridApi2.selection.getSelectedRows(), function(data, index) {
                $scope.existFilesGridData.data.splice($scope.existFilesGridData.data.lastIndexOf(data), 1);
                toUploadFiles.splice(toUploadFiles.lastIndexOf(data), 1);
            });
            $scope.gridApi2.selection.clearSelectedRows();
        };

        //Toast 메시지의 위치를 결정하기 위한 함수.
        function sanitizePosition() {
            var current = $scope.toastPosition;
            if (current.bottom && last.top) {
                current.top = false;
            }
            if (current.top && last.bottom) {
                current.bottom = false;
            }
            if (current.right && last.left) {
                current.left = false;
            }
            if (current.left && last.right) {
                current.right = false;
            }
            last = angular.extend({}, current);
        };

        var last = {
            bottom: true,
            top: false,
            left: false,
            right: true
        };
        $scope.toastPosition = angular.extend({}, last);
        //Toast 메시지의 위치를 얻기 위한 함수.
        $scope.getToastPosition = function() {
            sanitizePosition();
            return Object.keys($scope.toastPosition)
                .filter(function(pos) {
                    return $scope.toastPosition[pos];
                })
                .join(' ');
        };

        $scope.uploadCompletedText = "파일 업로드가 완료되었습니다.\n";
        //파일 업로드 완료 후에 나타낼 Toast 메시지를 출력하기 위한 함수.
        $scope.showUploadCompletedToast = function() {
            var pinTo = $scope.getToastPosition();
            $mdToast.show(
                $mdToast.simple()
                .textContent($scope.uploadCompletedText)
                .position(pinTo)
                .hideDelay(3000)
            );
        };
    };

    //자동 분류로 저장된 파일의 내용을 보여주는 다이얼로그를 출력하기 위한 함수.
    $scope.showAutoClassifiedListDialog = function(event) {
        //templateUrl로 지정된 외부 html 파일을 dialog로 출력하고 이를 위한 Controller는
        //controller로 지정된 함수를 사용.
        $mdDialog.show({
            controller: autoClassifiedListDialogController,
            templateUrl: 'dialog/auto_classified_list_dialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
        });
    };

    //매개 변수로 AngularJS에 대한 전역 변수, 다이얼로그 변수를 전달해
    //자동 분류 파일 목록 다이얼로그의 컨트롤러를 구성하기 위한 함수.
    function autoClassifiedListDialogController($scope, $mdDialog) {
        $scope.containerName = selectedFolderName;
        $scope.isAutoClassification = false;
        $scope.currentPath = "textcompare";
        $scope.selectedFolder;
        $scope.lastSelectedItem;
        var existFiles = [];
        $scope.selectedExistFile = [];
        $scope.isClickedNewFolderButton = false;
        $scope.newFolderName = "";
        $scope.hiddenUserId = currentUserId;
        $scope.existFilesGridData = {
            //마우스로 grid에 보이는 데이터 선택 가능.
            enableRowSelection: true,
            //데이터 선택을 위해 따로 앞쪽에 checkbox 만들지 않음.
            enableRowHeaderSelection: false,
            //검색 가능.
            enableFiltering: true,
            //표시할 데이터.
            data: 'existFilesGridData.data',
            //데이터 열 정의.
            columnDefs: [{
                field: 'name',
                displayName: '이름'
            }, {
                field: 'lastUpdate',
                displayName: '생성 날짜'
            }, {
                field: 'size',
                displayName: '크기'
            }, {
                field: 'format',
                displayName: '형식'
            }]
        };
        //여러 데이터 선택 불가.
        $scope.existFilesGridData.multiSelect = false;
        //Ctrl, Shift를 누른 상태에서는 그에 맞는 다중 선택 불가.
        $scope.existFilesGridData.modifierKeysToMultiSelect = false;
        //한번 더 선택하면 선택 취소 불가.
        $scope.existFilesGridData.noUnselect = false;
        //grid에 대한 데이터 초기화.
        $scope.existFilesGridData.data = [];
        //grid에 대한 callback 함수를 정의.
        //특정 열이 선택됐을 때 그 열을 저장하도록 구성하여 선택한 파일 또는 폴더 구분 가능.
        $scope.existFilesGridData.onRegisterApi = function(gridApi) {
            $scope.gridApi2 = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function(rows) {
                $scope.selectedExistFile = gridApi.selection.getSelectedRows();
                if ($scope.selectedExistFile.length != 0) {
                    $scope.lastSelectedItem = $scope.selectedExistFile[$scope.selectedExistFile.length - 1];
                    if ($scope.selectedExistFile[$scope.selectedExistFile.length - 1].format == "파일") {
                        console.log("선택된 파일의 이름: " + $scope.selectedExistFile[$scope.selectedExistFile.length - 1].name);
                    } else if ($scope.selectedExistFile[$scope.selectedExistFile.length - 1].format == "폴더") {
                        console.log("선택된 폴더의 이름: " + $scope.selectedExistFile[$scope.selectedExistFile.length - 1].name);
                        $scope.selectedFolder = $scope.selectedExistFile[$scope.selectedExistFile.length - 1];
                    } else {
                        console.log("선택된 것: ");
                        console.log($scope.selectedExistFile);
                    }
                }
            });
            gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows) {
                $scope.selectedExistFile = gridApi.selection.getSelectedRows();
            });
        };

        $scope.changeFolder = function() {
            $scope.isClickedNewFolderButton = false;
            console.log($scope.selectedFolder);
            console.log($scope.selectedFolder.name);
            console.log($scope.selectedFolder.lastUpdate);
            console.log($scope.selectedFolder.size);
            if ($scope.selectedFolder.name == ("(이전 폴더)") && $scope.selectedFolder.lastUpdate == ".." && $scope.selectedFolder.size == "..") {
                console.log("이전 폴더로 이동");
                $scope.currentPath = $scope.currentPath.substring(0, $scope.currentPath.lastIndexOf("/"));
            } else {
                console.log("그냥 폴더로 이동")
                $scope.currentPath += ("/" + $scope.selectedFolder.name);
            }
            console.log("다음 요청할 폴더 경로: " + $scope.currentPath);
            $scope.existFilesGridData.data = [];
            console.log("파일 목록 요청 시작");
            if ($scope.currentPath == "textcompare") {
                $http({
                    method: "POST",
                    url: "/requestfilelist",
                    data: {
                        "currentUserId": currentUserId,
                        "currentUserToken": currentUserToken,
                        "currentFolderPath": $scope.currentPath
                    }
                }).then(function successCallback(response) {
                    console.log("success: ");
                    console.log("받은 데이터:");
                    console.log(response);
                    if ($scope.currentPath != "textcompare") {
                        $scope.existFilesGridData.data.push({
                            "name": "(이전 폴더)",
                            "lastUpdate": "..",
                            "size": "..",
                            "format": "폴더"
                        });
                    }
                    for (var i = 0; i < response.data.folders.length; ++i) {
                        $scope.existFilesGridData.data.push(response.data.folders[i]);
                    }
                    for (var i = 0; i < response.data.files.length; ++i) {
                        $scope.existFilesGridData.data.push(response.data.files[i]);
                    }
                    console.log("현재 경로: " + $scope.currentPath);
                }, function errorCallback(response) {
                    console.log("error: " + response);
                });
                console.log("파일 목록 요청 끝");
            } else {
                $http({
                    method: "POST",
                    url: "/requestinnerfilelist",
                    data: {
                        "currentUserId": currentUserId,
                        "currentUserToken": currentUserToken,
                        "currentFolderPath": $scope.currentPath
                    }
                }).then(function successCallback(response) {
                    console.log("success: ");
                    console.log("받은 데이터:");
                    console.log(response);
                    if ($scope.currentPath != $scope.containerName) {
                        $scope.existFilesGridData.data.push({
                            "name": "(이전 폴더)",
                            "lastUpdate": "..",
                            "size": "..",
                            "format": "폴더"
                        });
                    }
                    for (var i = 0; i < response.data.folders.length; ++i) {
                        $scope.existFilesGridData.data.push(response.data.folders[i]);
                    }
                    for (var i = 0; i < response.data.files.length; ++i) {
                        $scope.existFilesGridData.data.push(response.data.files[i]);
                    }
                    console.log("현재 경로: " + $scope.currentPath);
                }, function errorCallback(response) {
                    console.log("error: " + response);
                });
                console.log("파일 목록 요청 끝");
            }
        };

        //메인 화면에서 매개 변수로 전달하는 특정 폴더를 더블클릭할 때의 동작을 결정하기 위한 함수.
        //해당 폴더에 대한 다이얼로그가 나타나도록 구성.
        $scope.onDblClickRow = function(row) {
            console.log("무언가 더블클릭됨");
            console.log($scope.lastSelectedItem);
            console.log($scope.selectedFolder);
            if ($scope.lastSelectedItem == $scope.selectedFolder) {
                console.log("폴더 " + $scope.selectedFolder.name + "이(가) 더블클릭됨.");
                $scope.changeFolder();
            }
        };
        console.log("파일 목록 요청 시작");
        $http({
            method: "POST",
            url: "/requestfilelist",
            data: {
                "currentUserId": currentUserId,
                "currentUserToken": currentUserToken,
                "currentFolderPath": $scope.currentPath
            }
        }).then(function successCallback(response) {
            console.log("success: ");
            console.log("받은 데이터:");
            console.log(response);

            for (var i = 0; i < response.data.folders.length; ++i) {
                $scope.existFilesGridData.data.push(response.data.folders[i]);
            }
            for (var i = 0; i < response.data.files.length; ++i) {
                $scope.existFilesGridData.data.push(response.data.files[i]);
            }
        }, function errorCallback(response) {
            console.log("error: " + response);
        });
        console.log("파일 목록 요청 끝");

        //새로 업로드하고자 하는 파일을 지정할 경우 파일 grid에 추가하고 실제 서버에 저장하기 위한 함수.
        $scope.fileChanged = function(element) {
            //선택된 파일들.
            var selectedFiles = element.files;
            //선택된 파일의 갯수.
            var numberOfSelectedFiles = selectedFiles.length;
            //파일의 갯수만큼 출력할 grid의 형식에 맞게 데이터 추가하고 업로드할 파일에 추가.
            /*
            for (var i = 0; i < numberOfSelectedFiles; ++i) {
                var currentFileInfo = {
                    format: getFileType(selectedFiles[i].name),
                    name: selectedFiles[i].name,
                    lastUpdate: selectedFiles[i].lastModifiedDate,
                    size: formatByte(selectedFiles[i].size)
                };
                $scope.existFilesGridData.data.push(currentFileInfo);
            }
            */
            //grid 갱신.
            $scope.$apply();
            $scope.uploadSelectedFiles();
        };

        //업로드하고자 하는 파일을 실제로 서버에 저장하기 위한 함수.
        //$scope.fileChanged(element) 내에서 호출.
        $scope.uploadSelectedFiles = function() {
            
            var obj;
            var fileName;
            var extName;
            
            // 파일을 업로드 한다.
            if ($scope.isAutoClassification) {
                var uploadFile = document.getElementById("fileClassificationButton")
            } else {
                var uploadFile = document.getElementById("fileUploadButton")
            }
            
            
            obj = document.actFrm.upFile;
            if (obj.value != "") {
                var pathHeader = obj.value.lastIndexOf("\\");
                var pathMiddle = obj.value.lastIndexOf(".");
                var pathEnd = obj.value.length;
                fileName = obj.value.substring(pathHeader + 1, pathMiddle);
                extName = obj.value.substring(pathMiddle + 1, pathEnd);
            }
            console.log("uploadFile.files:");
            console.log(uploadFile.files);
            
            if (!$scope.isAutoClassification) {
                console.log("파일 업로드 요청 시작(일반)");
                Upload.upload({
                    url: "/requestfileupload",
                    file: uploadFile.files[0],
                    data: {
                        "currentUserId": currentUserId,
                        "currentUserToken": currentUserToken,
                        "currentFolderPath": $scope.currentPath
                    }
                }).then(function successCallback(response) {
                    console.log("success: ");
                    console.log("받은 데이터:");
                    console.log(response);
                    $scope.existFilesGridData.data.push({
                        "name": uploadFile.files[0].name,
                        "lastUpdate": "만든 날짜(파일)",
                        "size": "파일의 크기",
                        "format": "파일"
                    });
                }, function errorCallback(response) {
                    console.log("error: ");
                    console.log(response);
                });
                console.log("파일 업로드 요청 끝(일반)");
            } else {
                console.log("파일 업로드 요청 시작(자동분류)");
                Upload.upload({
                    url: "/textcompare",
                    file: uploadFile.files,
                    data: {
                        "currentUserId": currentUserId,
                        "currentUserToken": currentUserToken,
                        "currentFolderPath": $scope.currentPath
                    }
                }).then(function successCallback(response) {
                    console.log("success: ");
                    console.log("받은 데이터:");
                    console.log(response);
                }, function errorCallback(response) {
                    console.log("error: ");
                    console.log(response);
                });
                console.log("파일 업로드 요청 끝(자동분류)");
            }
        };

        $scope.fileChangedByClassificationButton = function(element) {
            $scope.isAutoClassification = true;
            $scope.fileChanged(element);
        };

        $scope.fileChangedByUploadButton = function(element) {
            $scope.isAutoClassification = false;
            $scope.fileChanged(element);
        };

        //TODO.
        $scope.showCreateNewFolderForm = function() {
            $scope.newFolderName = "";
            $scope.isClickedNewFolderButton = true;
        };

        $scope.createNewFolder = function() {
            $http({
                method: "POST",
                url: "/requestcreatefolder",
                data: {
                    "currentUserId": currentUserId,
                    "currentUserToken": currentUserToken,
                    "currentFolderPath": "textcompare",
                    "currentNewFolderName": $scope.newFolderName
                }
            }).then(function successCallback(response) {
                console.log("success: ");
                console.log("받은 데이터:");
                console.log(response);
                $scope.existFilesGridData.data.push({ name: $scope.newFolderName, lastUpdate: "만든 날짜(폴더)", size: "폴더의 크기", format: "폴더" });
                //$scope.$apply;
            }, function errorCallback(response) {
                console.log("error: " + response);
            });
            $scope.isClickedNewFolderButton = false;
        };

        //파일 grid에서 삭제하고자 하는 파일을 실제 서버에서 제거하기 위한 함수.
        $scope.deleteFile = function() {
            console.log("파일 삭제 요청 시작");
            $http({
                method: "POST",
                url: "/requestfiledelete",
                data: {
                    "currentUserId": currentUserId,
                    "currentUserToken": currentUserToken,
                    "currentFolderPath": $scope.currentPath,
                    "currentFileName": $scope.selectedExistFile[0].name
                }
            }).then(function successCallback(response) {
                console.log("success: ");
                console.log("받은 데이터:");
                angular.forEach($scope.gridApi2.selection.getSelectedRows(), function(data, index) {
                    $scope.existFilesGridData.data.splice($scope.existFilesGridData.data.lastIndexOf(data), 1);
                });
                $scope.gridApi2.selection.clearSelectedRows();
            }, function errorCallback(response) {
                console.log("error: " + response);
            });
            console.log("삭제 요청 끝");
        };

        //파일 grid에 대해 선택된 열이 없는지를 판단.        
        $scope.isNotSelectedExistFiles = function() {
            if ($scope.selectedExistFile.length == 0) {
                return true;
            } else {
                return false;
            }
        };

        $scope.isPathContainer = function() {
            return $scope.currentPath == "textcompare";
        };

        //dialog 닫기.
        $scope.hide = function() {
            $mdDialog.hide();
        };

        //dialog 취소.
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
    };

    //악성 코드로 분류된 파일의 내용을 보여주는 다이얼로그를 출력하기 위한 함수.
    $scope.showMalwareFileListDialog = function(event) {
        //templateUrl로 지정된 외부 html 파일을 dialog로 출력하고 이를 위한 Controller는
        //controller로 지정된 함수를 사용.
        $mdDialog.show({
            controller: malwareFileListDialogController,
            templateUrl: 'dialog/malware_file_list_dialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
        });
    };

    //매개 변수로 AngularJS에 대한 전역 변수, 다이얼로그 변수를 전달해
    //자동 분류 파일 목록 다이얼로그의 컨트롤러를 구성하기 위한 함수.
    function malwareFileListDialogController($scope, $mdDialog) {
        $scope.containerName = selectedFolderName;
        $scope.currentPath = "malware";
        $scope.selectedFolder;
        $scope.lastSelectedItem;
        var existFiles = [];
        $scope.selectedExistFile = [];
        $scope.existFilesGridData = {
            //마우스로 grid에 보이는 데이터 선택 가능.
            enableRowSelection: true,
            //데이터 선택을 위해 따로 앞쪽에 checkbox 만들지 않음.
            enableRowHeaderSelection: false,
            //검색 가능.
            enableFiltering: true,
            //표시할 데이터.
            data: 'existFilesGridData.data',
            //데이터 열 정의.
            columnDefs: [{
                field: 'name',
                displayName: '이름'
            }, {
                field: 'lastUpdate',
                displayName: '생성 날짜'
            }, {
                field: 'size',
                displayName: '크기'
            }, {
                field: 'format',
                displayName: '형식'
            }]
        };
        //여러 데이터 선택 불가.
        $scope.existFilesGridData.multiSelect = false;
        //Ctrl, Shift를 누른 상태에서는 그에 맞는 다중 선택 불가.
        $scope.existFilesGridData.modifierKeysToMultiSelect = false;
        //한번 더 선택하면 선택 취소 불가.
        $scope.existFilesGridData.noUnselect = false;
        //grid에 대한 데이터 초기화.
        $scope.existFilesGridData.data = [];
        //grid에 대한 callback 함수를 정의.
        //특정 열이 선택됐을 때 그 열을 저장하도록 구성하여 선택한 파일 또는 폴더 구분 가능.
        $scope.existFilesGridData.onRegisterApi = function(gridApi) {
            $scope.gridApi2 = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function(rows) {
                $scope.selectedExistFile = gridApi.selection.getSelectedRows();
                if ($scope.selectedExistFile.length != 0) {
                    $scope.lastSelectedItem = $scope.selectedExistFile[$scope.selectedExistFile.length - 1];
                    if ($scope.selectedExistFile[$scope.selectedExistFile.length - 1].format == "파일") {
                        console.log("선택된 파일의 이름: " + $scope.selectedExistFile[$scope.selectedExistFile.length - 1].name);
                    } else if ($scope.selectedExistFile[$scope.selectedExistFile.length - 1].format == "폴더") {
                        console.log("선택된 폴더의 이름: " + $scope.selectedExistFile[$scope.selectedExistFile.length - 1].name);
                        $scope.selectedFolder = $scope.selectedExistFile[$scope.selectedExistFile.length - 1];
                    } else {
                        console.log("선택된 것: ");
                        console.log($scope.selectedExistFile);
                    }
                }
            });
            gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows) {
                $scope.selectedExistFile = gridApi.selection.getSelectedRows();
            });
        };
        //메인 화면에서 매개 변수로 전달하는 특정 폴더를 더블클릭할 때의 동작을 결정하기 위한 함수.
        //해당 폴더에 대한 다이얼로그가 나타나도록 구성.
        $scope.onDblClickRow = function(row) {
            console.log("무언가 더블클릭됨");
            console.log($scope.lastSelectedItem);
            console.log($scope.selectedFolder);
            if ($scope.lastSelectedItem == $scope.selectedFolder) {
                console.log("폴더 " + $scope.selectedFolder.name + "이(가) 더블클릭됨.");
                $scope.changeFolder();
            }
        };
        console.log("파일 목록 요청 시작");
        $http({
            method: "POST",
            url: "/requestfilelist",
            data: {
                "currentUserId": currentUserId,
                "currentUserToken": currentUserToken,
                "currentFolderPath": $scope.currentPath
            }
        }).then(function successCallback(response) {
            console.log("success: ");
            console.log("받은 데이터:");
            console.log(response);

            for (var i = 0; i < response.data.folders.length; ++i) {
                $scope.existFilesGridData.data.push(response.data.folders[i]);
            }
            for (var i = 0; i < response.data.files.length; ++i) {
                $scope.existFilesGridData.data.push(response.data.files[i]);
            }
        }, function errorCallback(response) {
            console.log("error: " + response);
        });
        console.log("파일 목록 요청 끝");

        //파일 grid에 대해 선택된 열이 없는지를 판단.        
        $scope.isNotSelectedExistFiles = function() {
            if ($scope.selectedExistFile.length == 0) {
                return true;
            } else {
                return false;
            }
        };

        //파일 grid에서 삭제하고자 하는 파일을 실제 서버에서 제거하기 위한 함수.
        $scope.deleteFile = function() {
            console.log("파일 삭제 요청 시작");
            $http({
                method: "POST",
                url: "/requestfiledelete",
                data: {
                    "currentUserId": currentUserId,
                    "currentUserToken": currentUserToken,
                    "currentFolderPath": $scope.currentPath,
                    "currentFileName": $scope.selectedExistFile[0].name
                }
            }).then(function successCallback(response) {
                console.log("success: ");
                console.log("받은 데이터:");
                angular.forEach($scope.gridApi2.selection.getSelectedRows(), function(data, index) {
                    $scope.existFilesGridData.data.splice($scope.existFilesGridData.data.lastIndexOf(data), 1);
                });
                $scope.gridApi2.selection.clearSelectedRows();
            }, function errorCallback(response) {
                console.log("error: " + response);
            });
            console.log("삭제 요청 끝");
            /*
            var xhr = new XMLHttpRequest(); //파일을 삭제하기 위한 객체
            //맨마지막에 자신이 업로드할때 올리고자 할 파일 이름 삽입
            xhr.open("DELETE", convertToCorsUrl("http://164.125.70.14:8505/v1/AUTH_" + sessionStorage.getItem("currentFolderId") + "/" + selectedFolderName + "/" + $scope.selectedExistFile[0].name), true);
            xhr.setRequestHeader("x-auth-token", getTokenFromSession()); //토큰 갱신될때마다 계속 바꿔주기 
            xhr.setRequestHeader("content-type", "text/html");
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.send();
            */
            angular.forEach($scope.gridApi2.selection.getSelectedRows(), function(data, index) {
                $scope.existFilesGridData.data.splice($scope.existFilesGridData.data.lastIndexOf(data), 1);
            });
            $scope.gridApi2.selection.clearSelectedRows();
        };

        //dialog 닫기.
        $scope.hide = function() {
            $mdDialog.hide();
        };

        //dialog 취소.
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
    };

    //grid에 대한 callback 함수를 정의.
    //특정 열이 선택됐을 때 그 열을 저장하도록 구성하여 선택한 폴더 구분 가능.
    $scope.gridOptions.onRegisterApi = function(gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function(row) {
            if (selectedRow_before != row.entity && selectedRow_before != null) {
                selectedRow_before.editable = false;
            }
            $scope.selectedFolder = gridApi.selection.getSelectedRows();
            selectedFolder = $scope.selectedFolder;
            selectedFolderName = selectedFolder[0].name;
            console.log("현재 선택된 컨테이너: " + selectedFolderName);
        });
        gridApi.selection.on.rowSelectionChangedBatch($scope, function(row) {
            $scope.selectedFolder = gridApi.selection.getSelectedRows();
            selectedFolder = $scope.selectedFolder;
        });
    };

    //메인 화면에서 매개 변수로 전달하는 특정 폴더를 더블클릭할 때의 동작을 결정하기 위한 함수.
    //해당 폴더에 대한 다이얼로그가 나타나도록 구성.
    $scope.onDblClickRow = function(row) {
        if (selectedFolder != undefined && selectedFolder.length == 1) {
            $scope.showFolderDialog();
        }
    };

    //매개 변수로 이벤트를 전달해 키보드 입력을 처리하기 위한 함수.
    //특정 폴더를 선택한 후 delete 키를 눌렀을 때의 동작을 정의.
    //비어 있다면 그 폴더가 삭제되고, 비어 있지 않다면 삭제할 수 없다는 다이얼로그 출력.
    $scope.keypress = function(e) {
        var selectedRow = $scope.gridApi.selection.getSelectedRows();
        if (selectedRow.length == 0) return;
        if (e.which == 46) {
            if (selectedRow[0].numberOfObject == "0") {
                angular.forEach(selectedRow, function(data, index) {
                    /*
                    $scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(data), 1);
                    var xhr = new XMLHttpRequest(); //폴더를 삭제하기 위한 객체
                    //맨마지막에 자신이 업로드할때 올리고자 할 파일 이름 삽입
                    xhr.open("DELETE", convertToCorsUrl("http://164.125.70.14:8505/v1/AUTH_" + sessionStorage.getItem("currentFolderId") + "/" + selectedRow[0].name), true);
                    //토큰 갱신될때마다 계속 바꿔주기 
                    xhr.setRequestHeader("x-auth-token", getTokenFromSession());
                    xhr.setRequestHeader("content-type", "text/html");
                    xhr.setRequestHeader("cache-control", "no-cache");
                    xhr.send();
                    selected_length = selectedRow.length;
                    */
                    $scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(data), 1);
                    //TODO. 컨테이너 삭제에 대한 동작 구현.
                });
                showSnackbar();
                $scope.gridApi.selection.clearSelectedRows();
            } else {
                //삭제하고자 하는 폴더가 비어 있지 않아 제거할 수 없다는 다이얼로그를 출력하기 위한 함수.
                $scope.showAlertDialog = function(event) {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .clickOutsideToClose(true)
                        .title('제거할 수 없음')
                        .textContent('폴더가 비어 있지 않아 제거할 수 없습니다.')
                        .ariaLabel('alertDialog')
                        .ok('확인')
                        .targetEvent(event)
                    );
                };

                $scope.showAlertDialog(e);
            }
        }
    };


}]);

//UnhandledRejection 오류 해결(AngularJS 1.6.x 버그)
//HTML에서 변수 바인딩 문자를 {{, }}에서 [[, ]]로 교체(Flask Jinja2와 충돌)
app.config(['$qProvider', '$interpolateProvider', function($qProvider, $interpolateProvider) {
    $qProvider.errorOnUnhandledRejections(false);
    $interpolateProvider.startSymbol('[[').endSymbol(']]');
}]);
/*
var dialog3 = document.querySelector('#dialog3');
var input_dialog3 = dialog3.querySelector('#input');
var showDialogButton3 = document.getElementById('create_folder');
if (!dialog.showModal) {
    dialogPolyfill.registerDialog(dialog3);
}
//"새 폴더" 버튼을 눌렀을 때의 동작을 정의하기 위한 함수 정의.
//새 폴더를 만들기 위한 다이얼로그 출력.
showDialogButton3.addEventListener('click', function() {
    dialog3.showModal();
});

var createFolderButton = document.getElementById('createFolderButton');
createFolderButton.onclick = function() {

}

//새 폴더를 만들기 위한 다이얼로그에 대해 폴더 이름을 입력한 후 확인 버튼을 눌렸을 때의 동작을 정의하기 위한 함수 정의.
//입력한 값을 이용해 새 폴더를 만들고 서버에 새로운 폴더 생성.
dialog3.querySelector('#button_ok').addEventListener('click', function() {
    new_folder_name = input_dialog3.value;
    if (new_folder_name != '') {
        input_dialog3.value = '';
        var xhr = new XMLHttpRequest(); //폴더를 생성하기 위한 객체
        xhr.open("PUT", convertToCorsUrl("http://164.125.70.14:8505/v1/AUTH_" + sessionStorage.getItem("currentFolderId") + "/" + new_folder_name), true); //맨마지막에 자신이 업로드할때 올리고자 할 파일 이름 삽입
        //오브젝트 생성시 url에 http://164.125.70.14:8505/v1/AUTH_146ad31ee75f4fffb874ee31f35f6a92/test9/objectname
        xhr.setRequestHeader("x-auth-token", getTokenFromSession()); //토큰 갱신될때마다 계속 바꿔주기 
        xhr.setRequestHeader("content-type", "text/html");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.send(); //null 넣어보기 ? 
        dialog3.close();
    }
});
//새 폴더를 만들기 위한 다이얼로그에 대해 "취소" 버튼을 눌렀을 때의 동작을 정의하기 위한 함수 정의.
//해당 다이얼로그가 닫히도록 구성.
dialog3.querySelector('.close').addEventListener('click', function() {
    dialog3.close();
});
*/
var snackbarContainer = document.querySelector('#demo-snackbar-example');
//폴더 삭제 후 나타낼 Snack bar를 정의하기 위한 함수.
function showSnackbar() {
    'use strict';
    var data = {
        message: "폴더 삭제 완료",
        timeout: 3000
    };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
};