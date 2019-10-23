
class Constants {
  static devTest = 'dev_test';
  static staging = 'staging';
}



const omitParam = (param) => {
  return param.replace(/(\#|\.)/g, '');
};



class Vendors {
  /**
   * @function 抓取当前页面所在发布舞台
   * @param {*} param 
   * @returns 'staging' | 'dev-test' | 'prod'
   */
  static getStage(param) {
    const lowerParam = param.toLowerCase();
    return lowerParam.includes(Constants.staging) ?
      'staging'
      :
      lowerParam.includes(Constants.devTest) ? 'dev-test' : undefined;
  }



  /**
   * 获取当前页面显示的最后一次构建编号
   */
  static getLastestReleaseCode = () => {

  }



  /**
   * 
   * @param {*} release_code 
   */
  static generateOnePieceOfShit = (release_code) => {

  }



  /**
   * 
   */
  static $ = (param) => {
    if (typeof param !== 'string') {
      return;
    }
    if (param[0] === '.') {
      return document.getElementsByClassName(omitParam(param));
    } else if (param[0] === '#') {
      return [document.getElementById(omitParam(param))];
    } else {
      return document.getElementsByTagName(omitParam(param));
    }
  }



};


console.log(window.location.href, Vendors.getStage(window.location.href) === 'staging');