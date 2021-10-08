# 화이트보드

### 화이트보드, 복잡한 지식을을 시각화화여 쉽게 이해하도록 도와주며 개개인에게 그룹안에서 개입성을 증가시켜 프로젝트, 미팅, 또는 그룹활동 내에서 효율성을 증가시킵니다. 또한, 화이트보드에서 제공하는 기능들을 통해  작업을 보다 원할하게 수행할 수 있습니다. 게다가 인터넷을 통하여 언제어디서든 사용 할 수 있는 장점이 있습니다.
<br/>

## 환경설정
| name | version |
|---|---|
| Angular | 12.2.9 |
| Node | v14.17.3 |
| Npm | 6.14.13 |
<br/>

## 필요 모듈
npm install -g @angular/cli <br/>
ng add @angular/material <br/>
npm install @angular/flex-layout <br/>
<br/>

## 실행
npm start
<br/><br/>

## 기능
![0](https://user-images.githubusercontent.com/91444796/146321642-b4f9239f-7caa-456a-a869-663f70b3f3c7.png)
* 펜 선택
* 지우개 선택
* 컬러 선택
* 펜 및 지우개 사이즈 선택
* 페이지 추가
* 페이지 삭제
* 페이지 가로기준 최대 확대
* 페이지 세로기준 최대 확대
* 줌인
* 줌아웃
---
<br/>

### 펜 드로잉
![1](https://user-images.githubusercontent.com/91444796/146326453-5155cc34-9649-4d72-aef4-1d4695742969.png) <br/>
#### 펜을 이용하여 원하는 것을 그리기
---
<br/>

### 지우개
![2](https://user-images.githubusercontent.com/91444796/146328575-314a1014-b502-4dcd-974d-7f4955dd970d.png) <br/>
#### 지우개를 이용하며 [concept] 부분 지움
---
### 캔버스 부분 확대
![3](https://user-images.githubusercontent.com/91444796/146329559-01f8f7d6-4c97-4fc0-a4af-d27fafea48d0.png)
#### 분홍버튼 클릭시 파란색선만큼의 윈도우 가로길이만큼 캔버스 크기를 조정 
<br/>

![4](https://user-images.githubusercontent.com/91444796/146331094-c0df5536-40a2-40cd-a477-65e774600b14.png)
#### 분홍버튼 클릭시 파란색선만큼의 윈도우 세로길이만큼 캔버스 크기를 조정
---
<br/>

### 펜 사이즈 조정
![6](https://user-images.githubusercontent.com/91444796/146332011-2e62a9b7-95c9-45d8-b395-f9bb8af8ee29.png)
#### 윈도우 위 화면에 보이는 분홍 박스안의 3개의 버튼을 클릭하여 펜 굵기를 조정
---
<br/>

### 펜 컬러 조정
![7](https://user-images.githubusercontent.com/91444796/146332719-de2bdaaf-44f3-470c-b0e3-43de1bdb102d.png)
#### 윈도우 위 화면에 보이는 분홍 박스안의 컬러들을 클릭하여 펜 컬러를 조정
---
<br/>

### 페이지 추가

![8 0](https://user-images.githubusercontent.com/91444796/146333651-31008150-7237-4dd2-a1f3-1a10892b8885.png)
#### ADD PAGE 클릭하면 새로운 페이지 생성
<br/>
![8](https://user-images.githubusercontent.com/91444796/146333779-056e2e4a-c63f-48eb-baf5-277e13ed3af3.png)
#### 왼쪽 사이드에 보이는 2번째 빈 페이지를 클릭하면 클릭된 페이지로 이동
---
<br/>

### 페이지 삭제
![after deleting](https://user-images.githubusercontent.com/91444796/146333989-b06295a1-7d7d-4ce2-9686-6864205d29ce.png)
#### 페이지 삭제를 클릭 시 현재 보이는 페이지가 삭제됨

.
awe1231231r
q12312eq12323123weqeqweaw
q3121e23123112qwweraw
sf23123awe1231223123141qweweqewaewra
aqwqwee3123q123123werawe
adgh123123ewrafgadfa
31123123
123123
123123123ra
1231er
aew2312323122312r
aewr123awe31231231
23312331
23123
12312
const member = require('../../../../../models/member_schema');
const manager = require('../../../../../models/manager_schema');
const { ObjectId } = require('bson');

exports.getPendingList = async (req, res) => {
	console.log(`
--------------------------------------------------
  User : ${req.decoded._id}
  API  : Get Pending List
  router.get('/pending-list', employeeMngmtCtrl.getPendingList);
--------------------------------------------------`);
	const dbModels = global.DB_MODELS;

	try {
		const pendingList = await dbModels.Manager.aggregate([
			{
				$match: {
					myManager: ObjectId(req.decoded._id),
					accepted: false
				}
			},
			{
				$lookup: {
					from: 'members',
					localField: 'myId',
					foreignField: '_id',
					as: 'requesterInfo'
				},
			},
			{
				$unwind: {
					path: '$requesterInfo',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$project: {
					_id: 1,
					myId: 0,
					myManager: 0,
					accepted: 0,
					'requesterInfo.password': 0,
				}
			}
		]);

		console.log(pendingList)

		return res.status(200).send({
			message: 'found',
			pendingList
		});

	} catch (err) {
		return res.status(500).send({
			message: 'DB Error'
		});
	}
};

exports.cancelRequest = async (req, res) => {
	console.log(`
--------------------------------------------------
	User : ${req.decoded._id}
	API  : Cancel Employee's request
	router.delete('/cancel-request', employeeMngmtCtrl.cancelRequest);

	manager_id  : ${req.params.id}
--------------------------------------------------`);

	try {

		const criteria = {
			_id: req.params.id
		}

		await manager.deleteOne(criteria);

		return res.status(200).send({
			message: 'canceled'
		});

	} catch (err) {
		return res.status(500).send({
			message: 'DB Error'
		});
	}

};

exports.acceptRequest = async (req, res) => {
	console.log(`
--------------------------------------------------  
	User : ${req.decoded._id}  
	API  : put acceptRequest
	router.put('/accept-request', employeeMngmtCtrl.acceptRequest) 
	query: ${JSON.stringify(req.body)} docId, userId
--------------------------------------------------`);

	const dbModels = global.DB_MODELS;

	try {

		const updateCriteria = {
			_id: req.body.docId,
			myId: req.body.userId
		}

		const updateData = {
			accepted: true
		}

		const updatedData = await dbModels.Manager.findOneAndUpdate(updateCriteria, updateData);
		if (!updatedData) {
			return res.status(404).send('the update has failed');
		}


		console.log(updatedData);

		const criteria = {
			_id: req.decoded._id
		}

		const updateManagerData = {
			isManager: true
		}

		const updatedUser = await dbModels.Member.findOneAndUpdate(criteria, updateManagerData);
		if (!updatedUser) {
			return res.status(404).send('the user update has failed');
		}

		return res.status(200).send({
			message: 'accepted'
		});

	} catch (err) {
		return res.status(500).send({
			message: 'DB Error'
		});
	}

};

exports.myEmployeeList = async (req, res) => {
	console.log(`
--------------------------------------------------
  User : ${req.decoded._id}
  API  : Get my Employee List
  router.get('/myEmployee-list', employeeMngmtCtrl.myEmployeeList);
--------------------------------------------------`);

	const dbModels = global.DB_MODELS;

	try {

		// 관리하고 있는 직원들 in manager
		// myManager > 매니저 아이디, myId > 직원 아이디, accepted: true or false, 펜딩 or 수락


		const manager = await dbModels.Manager.find(
            {
                myManager: ObjectId(req.decoded._id)
            },
            {
                myId: 1,
                accepted: 1,
            }
        ).lean()
        // console.log(manager);
        const mngEmployee = [];

        for (let index = 0; index < manager.length; index++) {
            const element = manager[index].myId;
            mngEmployee.push(element);
        }

		const myEmployeeList = await dbModels.Member.aggregate([
            {
                $match: {
                    _id: { $in: mngEmployee }
                }
            },
            {
                $lookup: {
                    from: 'peronalleavestandards',
                    localField: '_id',
                    foreignField: 'member_id',
                    as: 'totalLeave'
                }
            },
            {
                $addFields: {
                    year: {
                        $floor: {
                            $let: {
                                vars: {
                                    diff: {
                                        $subtract: [new Date(), "$emp_start_date"]
                                    }
                                },
                                in: {
                                    $divide: ["$$diff", (365 * 24 * 60 * 60 * 1000)]
                                }
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'leaverequests',
                    let: {
                        userId: '$_id',
                        years: '$year',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$requestor", "$$userId"] },
                                        { $eq: ["$year", "$$years"] }

                                    ]
                                }
                            }
                        },
                        {
                            $facet: {
                                used_annual_leave: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$leaveType", 'annual_leave']
                                            }
                                        }
                                    },
                                    {
                                        $group: {
                                            _id: null,
                                            sum: {
                                                "$sum": "$leaveDuration"
                                            }
                                        }
                                    }
                                ],
                                used_sick_leave: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$leaveType", 'sick_leave']
                                            }
                                        }
                                    },
                                    {
                                        $group: {
                                            _id: null,
                                            sum: {
                                                "$sum": "$leaveDuration"
                                            }
                                        }
                                    }
                                ],
                                used_replacement_leave: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$leaveType", 'replacement_leave']
                                            }
                                        }
                                    },
                                    {
                                        $group: {
                                            _id: null,
                                            sum: {
                                                "$sum": "$leaveDuration"
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                    , as: "usedLeave"
                }
            },
            {
                $unwind: {
                    path: '$totalLeave',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: '$usedLeave',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    year: 1,
                    position: 1,
                    location: 1,
                    emp_start_date: 1,
                    emp_end_date: 1,
                    isManager: 1,
                    totalLeave: {
                        $arrayElemAt: ["$totalLeave.leave_standard", "$year"]
                    },
                    usedLeave: 1
                }
            }
        ]);

		return res.status(200).send({
			message: 'found',
			myEmployeeList
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			message: 'DB Error'
		});
	}

};

exports.getEmployeeInfo = async (req, res) => {
	console.log(`
--------------------------------------------------
  User : ${req.decoded._id}
  API  : Get my Employee Info to edit
  router.get('/employee-info', employeeMngmtCtrl.getEmployeeInfo);
  a employee_id : ${req.params.id}
--------------------------------------------------`);

	const dbModels = global.DB_MODELS;

	try {

		const criteria = {
			_id: req.params.id
		}

		const projection = 'name position location emp_start_date emp_end_date annual_leave sick_leave replacementday_leave';

		const employee = await dbModels.Member.findOne(criteria, projection);
		// console.log(employee);
		if (!employee) {
			return res.status(400).send({
				message: 'Cannot find the manager'
			});
		}

		return res.status(200).send({
			message: 'found',
			employee
		});

	} catch (err) {

		return res.status(500).send('DB Error');

	}
};

exports.UpdateEmployeeInfo = async (req, res) => {
	console.log(`
--------------------------------------------------  
	User : ${req.decoded._id}  
	API  : put UpdateEmployeeInfo
	router.put('/put-employee-info', employeeMngmtCtrl.UpdateEmployeeInfo) 
	query: ${JSON.stringify(req.body)} update UserInfo
--------------------------------------------------`);

	const dbModels = global.DB_MODELS;

	try {

		const criteria = {
			_id: req.body.employeeId
		}
		
		const updateData = {
			name: req.body.name,
			position: req.body.position,
			location: req.body.location,
			emp_start_date: req.body.emp_start_date,
			emp_end_date: req.body.emp_end_date,
			annual_leave: req.body.annual_leave,
			sick_leave: req.body.sick_leave,
			replacementday_leave: req.body.replacementday_leave,
		}

		const employee = await dbModels.Member.findOneAndUpdate(criteria, updateData);

		if (!employee) {
			return res.status(400).send({
				message: 'Cannot find the manager'
			});
		}

		return res.status(200).send({
			message: 'updated',

		});

	} catch (err) {

		return res.status(500).send('DB Error');

	}

};

exports.myEmployeeLeaveListSearch = async (req, res) => {
	console.log(`
--------------------------------------------------
  User : ${req.decoded._id}
  API  : Get my Employee Leave List
  router.get('/myEmployee-leaveList', employeeMngmtCtrl.myEmployeeLeaveList);
--------------------------------------------------`);

	data = req.query;
	console.log(data.emailFind);
	if (data.emailFind == '' || data.emailFind == 'null') {
		data.emailFind = 'all';
	}
	console.log(data.emailFind);
	console.log(data);

	startDatee = new Date(data.leave_start_date);
	endDatee = new Date(data.leave_end_date);

	const dbModels = global.DB_MODELS;
	try {

		// 관리하고 있는 직원들 in manager
		// myManager > 매니저 아이디, myId > 직원 아이디, accepted: true or false, 펜딩 or 수락

		const myEmployeeLeaveListSearch = await dbModels.Manager.aggregate([
			{
				$match: {
					myManager: ObjectId(req.decoded._id),
				}
			},
			{
				$lookup: {
					from: 'leaverequests',
					localField: 'myId',
					foreignField: 'requestor',
					as: 'leave'
				},
			},
			{
				$lookup: {
					from: 'members',
					localField: 'myId',
					foreignField: '_id',
					as: 'memberName'
				},
			},
			{
				$lookup: {
					from: 'members',
					localField: 'myManager',
					foreignField: '_id',
					as: 'approverName'
				},
			},
			{
				$unwind: {
					path: '$leave',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$unwind: {
					path: '$memberName',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$addFields: {
					leaveTypeStand: 'all',
					emailStand: 'all'
				}
			},
			{
				$project: {
					name: '$memberName.name',
					duration: '$leave.leaveDuration',
					leaveType: '$leave.leaveType',
					leaveTypeStand: {
						$cond: {
							if: { $eq: ["$leave.leaveType", data.type] },
							then: data.type,
							else: 'all'
						}
					},
					startDate: '$leave.leave_start_date',
					endDate: '$leave.leave_end_date',
					email: '$memberName.email',

					emailStand: {
						$cond: {
							if: { $eq: ['$memberName.email', data.emailFind] },
							then: '$memberName.email',
							else: 'all'
						}
					},
					status: '$leave.status',
					createdAt: '$leave.createdAt',
					approver: '$approverName.name',
					leave_reason: '$leave.leave_reason',
					rejectReason: '$leave.rejectReason'
				}
			},
			{
				$match: {
					startDate: { $gte: startDatee, $lte: endDatee },
					emailStand: data.emailFind,
					leaveTypeStand: data.type,
				}
			},
			// {
			// 	$sort: {
			// 		startDate: 1
			// 	}
			// }
		]);
		console.log(myEmployeeLeaveListSearch);


		const myEmployeeList = await dbModels.Manager.aggregate([
			{
				$match: {
					myManager: ObjectId(req.decoded._id),
					accepted: true
				}
			},
			{
				$lookup: {
					from: 'members',
					localField: 'myId',
					foreignField: '_id',
					as: 'myEmployeeInfo'
				},
			},
			{
				$unwind: {
					path: '$myEmployeeInfo',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$project: {
					name: '$myEmployeeInfo.name',
					email: '$myEmployeeInfo.email',
				}
			}
		]);
		// console.log(myEmployeeList);

		return res.status(200).send({
			message: 'my Employee Leave list',
			myEmployeeLeaveListSearch,
			myEmployeeList
		});
	} catch (err) {
		return res.status(500).send('DB Error');
	}
};


// exports.myManagerEmployeeList = async (req, res) => {
// 	console.log(`
// --------------------------------------------------
//   User : ${req.decoded._id}
//   API  : Get my Employee Leave List
//   router.get('/myManager-employee-list', employeeMngmtCtrl.myManagerEmployeeList);
// --------------------------------------------------`);
// 	data = req.query;
// 	console.log(data);

// 	const dbModels = global.DB_MODELS;
// 	try {
// 		// const myManagerEmployeeList = await dbModels.Manager.aggregate([
// 		// 	{
// 		// 		$match: {
// 		// 			myManager: ObjectId(data.managerID),
// 		// 			accepted: true
// 		// 		}
// 		// 	},
// 		// 	{
// 		// 		$lookup: {
// 		// 			from: 'members',
// 		// 			localField: 'myId',
// 		// 			foreignField: '_id',
// 		// 			as: 'myEmployeeInfo'
// 		// 		},
// 		// 	},
// 		// 	{
// 		// 		$unwind: {
// 		// 			path: '$myEmployeeInfo',
// 		// 			preserveNullAndEmptyArrays: true
// 		// 		}
// 		// 	},
// 		// 	{
// 		// 		$project: {
// 		// 			_id: 1,
// 		// 			myEmployeeId: '$myEmployeeInfo._id',
// 		// 			name: '$myEmployeeInfo.name',
// 		// 			// annual_leave: '$myEmployeeInfo.annual_leave',
// 		// 			// sick_leave: '$myEmployeeInfo.sick_leave',
// 		// 			// replacementday_leave: '$myEmployeeInfo.replacementday_leave',
// 		// 			location: '$myEmployeeInfo.location',
// 		// 			emp_start_date: '$myEmployeeInfo.emp_start_date',
// 		// 			emp_end_date: '$myEmployeeInfo.emp_end_date',
// 		// 			position: '$myEmployeeInfo.position'
// 		// 		}
// 		// 	}
// 		// ]);

// 		const manager = await dbModels.Manager.find(
//             {
//                 myManager: ObjectId(data.managerID)
//             },
//             {
//                 myId: 1,
//                 accepted: 1,
//             }
//         ).lean()
//         // console.log(manager);
//         const mngEmployee = [];

//         for (let index = 0; index < manager.length; index++) {
//             const element = manager[index].myId;
//             mngEmployee.push(element);
//         }
//         // console.log(mngEmployee);

// 		const myManagerEmployeeList = await dbModels.Member.aggregate([
//             {
//                 $match: {
//                     _id: { $in: mngEmployee }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'peronalleavestandards',
//                     localField: '_id',
//                     foreignField: 'member_id',
//                     as: 'totalLeave'
//                 }
//             },
//             {
//                 $addFields: {
//                     year: {
//                         $floor: {
//                             $let: {
//                                 vars: {
//                                     diff: {
//                                         $subtract: [new Date(), "$emp_start_date"]
//                                     }
//                                 },
//                                 in: {
//                                     $divide: ["$$diff", (365 * 24 * 60 * 60 * 1000)]
//                                 }
//                             }
//                         }
//                     }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'leaverequests',
//                     let: {
//                         userId: '$_id',
//                         years: '$year',
//                     },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$requestor", "$$userId"] },
//                                         { $eq: ["$year", "$$years"] }

//                                     ]
//                                 }
//                             }
//                         },
//                         {
//                             $facet: {
//                                 used_annual_leave: [
//                                     {
//                                         $match: {
//                                             $expr: {
//                                                 $eq: ["$leaveType", 'annual_leave']
//                                             }
//                                         }
//                                     },
//                                     {
//                                         $group: {
//                                             _id: null,
//                                             sum: {
//                                                 "$sum": "$leaveDuration"
//                                             }
//                                         }
//                                     }
//                                 ],
//                                 used_sick_leave: [
//                                     {
//                                         $match: {
//                                             $expr: {
//                                                 $eq: ["$leaveType", 'sick_leave']
//                                             }
//                                         }
//                                     },
//                                     {
//                                         $group: {
//                                             _id: null,
//                                             sum: {
//                                                 "$sum": "$leaveDuration"
//                                             }
//                                         }
//                                     }
//                                 ],
//                                 used_replacement_leave: [
//                                     {
//                                         $match: {
//                                             $expr: {
//                                                 $eq: ["$leaveType", 'replacement_leave']
//                                             }
//                                         }
//                                     },
//                                     {
//                                         $group: {
//                                             _id: null,
//                                             sum: {
//                                                 "$sum": "$leaveDuration"
//                                             }
//                                         }
//                                     }
//                                 ]
//                             }
//                         }
//                     ]
//                     , as: "usedLeave"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: '$totalLeave',
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $unwind: {
//                     path: '$usedLeave',
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     name: 1,
//                     year: 1,
//                     position: 1,
//                     location: 1,
//                     emp_start_date: 1,
//                     emp_end_date: 1,
//                     isManager: 1,
//                     totalLeave: {
//                         $arrayElemAt: ["$totalLeave.leave_standard", "$year"]
//                     },
//                     usedLeave: 1
//                 }
//             }
//         ]);

// 		console.log(myManagerEmployeeList);
// 		return res.status(200).send({
// 			message: 'connected managerEmployeeList',
// 			myManagerEmployeeList
// 		});

// 	} catch (error) {
// 		return res.status(500).send('DB Error');
// 	}
// };