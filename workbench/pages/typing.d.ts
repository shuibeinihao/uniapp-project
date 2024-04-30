declare type Menu {
  title: string;
  icon: string;
  path: string;
}

declare namespace Customer {
  type List = Array<Detail>

  type Detail = {
    customerId: string;
    customerName: string;
    sourceType: string;
    sourceTypeName: string;
    phoneNumber: string;
    nation: string;
    nationName: string;
    idCard: string;
    sex: string;
    password: string;
    openId: string;
    birthday: string;
    address: string;
    /** T 已实名 */
    verify: string;
    education: string;
    educationName: string;
    title: string;
    titleName: string;
    tattoo: string;
    tattooName: string;
    dialState: string;
    dialStateName: string;
    type: string;
    typeName: string;
    identity: string;
    identityName: string;
    contactTime: string;
    remark: string;
    age: number;
    provinceCode: string;
    agentId: string;
    agentName: string;
    jobExperience: string;
    pictures: string;
    createTime: string;
    bankName: string;
    bankCard: string;
    bankBranch: string;
    resumeCreateTime: string;
    resumeUpdateTime: string;
    emergencyName: string;
    emergencyPhone: string;
    emergencyAddress: string;
    email: string;
    avatar: string;
    referrerId: string;
    referrerIdCard: string;
    referrerIdentityName: string;
    referrerName: string;
    level: string;
    nickName: string;
    cardOrg: string;
    cardValidDate: string;
    platform: string;
    uniId: string;
  }
}