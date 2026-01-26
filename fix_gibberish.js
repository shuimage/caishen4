const fs = require('fs');
const path = require('path');

// 定义乱码字符的替换映射
const replacementMap = {
  '�': '', // 空字符，用于替换无法识别的乱码
  '日�?': '日期',
  '回�?': '回测',
  '次�?': '次数',
  '失�?': '失败',
  '数�?': '数据',
  '默认�?': '默认值',
  '期�?': '期数',
  '数据不存�?': '数据不存在',
  '下�?': '下一期',
  '上�?': '上一期',
  '中�?': '中奖',
  '平�?': '平均',
  '最�?': '最高',
  '最�?': '最低',
  '详�?': '详情',
  '分�?': '分析',
  '杀�?': '杀号',
  '买�?': '买号',
  '后�?': '后区',
  '前�?': '前区',
  '两�?': '两球',
  '三�?': '三球',
  '组�?': '组合',
  '出�?': '出现',
  '概�?': '概率',
  '统�?': '统计',
  '范�?': '范围',
  '最�?期': '最新期',
  '倒�?': '倒数',
  '�?': '号',
  '�?': '率',
  '�?': '数',
  '�?': '据',
  '�?': '期',
  '�?': '回',
  '�?': '测',
  '�?': '次',
  '�?': '失',
  '�?': '败',
  '�?': '默',
  '�?': '认',
  '�?': '值',
  '�?': '中',
  '�?': '奖',
  '�?': '平',
  '�?': '均',
  '�?': '最',
  '�?': '高',
  '�?': '低',
  '�?': '详',
  '�?': '细',
  '�?': '分',
  '�?': '析',
  '�?': '杀',
  '�?': '买',
  '�?': '后',
  '�?': '前',
  '�?': '两',
  '�?': '三',
  '�?': '组',
  '�?': '合',
  '�?': '出',
  '�?': '现',
  '�?': '概',
  '�?': '率',
  '�?': '统',
  '�?': '计',
  '�?': '范',
  '�?': '围'
};

// 获取所有带有乱码的文件列表
const filesWithGibberish = [
  'd:\\中啦\\caishen4\\qian\\dao_shu_5_qi_liang_qiu_zu_he_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\zu_he_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_2_qi_hou_ping_jun_lv_zui_gao_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_2_qi_liang_qiu_zu_he_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_2_qi_hou_qu_sha_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\san_qiu_ping_jun_lv_zui_gao_detail.html',
  'd:\\中啦\\caishen4\\qian\\san_qiu_ping_jun_lv_zui_di_detail.html',
  'd:\\中啦\\caishen4\\qian\\san_qiu_sha_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\ping_jun_lv_zui_gao_detail.html',
  'd:\\中啦\\caishen4\\qian\\ping_jun_lv_zui_di_detail.html',
  'd:\\中啦\\caishen4\\qian\\index.html',
  'd:\\中啦\\caishen4\\qian\\second_script.js',
  'd:\\中啦\\caishen4\\qian\\index.html.bak',
  'd:\\中啦\\caishen4\\qian\\sha_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\sha_hao_hui_ce_hou_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\sha_hao_hou_ping_jun_lv_zui_gao_detail.html',
  'd:\\中啦\\caishen4\\qian\\sha_hao_hou_ping_jun_lv_zui_di_detail.html',
  'd:\\中啦\\caishen4\\qian\\sha_hao_hou_mai_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\san_qiu_zu_he_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\san_qiu_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\huan_yuan_hui_ce_zhou_xian.html',
  'd:\\中啦\\caishen4\\qian\\huan_yuan_hui_ce_yuan_huan.html',
  'd:\\中啦\\caishen4\\qian\\huan_yuan_hui_ce_re_leng.html',
  'd:\\中啦\\caishen4\\qian\\huan_yuan_hui_ce_jing_xiang.html',
  'd:\\中啦\\caishen4\\qian\\huan_yuan_hui_ce_hu_bu.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_5_qi_sha_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_5_qi_ping_jun_lv_zui_gao_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_5_qi_ping_jun_lv_zui_di_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_5_qi_mai_hao_qian_qu_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_5_qi_mai_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_5_qi_hou_qu_sha_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_5_qi_hou_ping_jun_lv_zui_gao_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_5_qi_hou_ping_jun_lv_zui_di_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_4_qi_sha_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_4_qi_ping_jun_lv_zui_gao_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_4_qi_ping_jun_lv_zui_di_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_4_qi_mai_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_4_qi_mai_hao_hui_ce_hou_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_4_qi_liang_qiu_zu_he_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_4_qi_hou_qu_sha_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_4_qi_hou_ping_jun_lv_zui_gao_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_4_qi_hou_ping_jun_lv_zui_di_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_3_qi_sha_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_3_qi_san_qiu_zu_he_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_3_qi_san_qiu_sha_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_3_qi_san_qiu_ping_jun_lv_zui_gao_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_3_qi_san_qiu_mai_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_3_qi_ping_jun_lv_zui_gao_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_3_qi_ping_jun_lv_zui_di_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_3_qi_mai_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_3_qi_mai_hao_hui_ce_hou_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_3_qi_liang_qiu_zu_he_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_3_qi_liang_qiu_ping_jun_lv_zui_gao_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_3_qi_liang_qiu_ping_jun_lv_zui_di_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_3_qi_hou_qu_sha_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_3_qi_hou_ping_jun_lv_zui_gao_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_3_qi_hou_ping_jun_lv_zui_di_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_2_qi_sha_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_2_qi_san_qiu_zu_he_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_2_qi_san_qiu_sha_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_2_qi_san_qiu_ping_jun_lv_zui_gao_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_2_qi_san_qiu_mai_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_2_qi_ping_jun_lv_zui_gao_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_2_qi_ping_jun_lv_zui_di_detail.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_2_qi_mai_hao_hui_ce_xiang_qing.html',
  'd:\\中啦\\caishen4\\qian\\dao_shu_2_qi_mai_hao_hui_ce_hou_xiang_qing.html'
];

// 修复文件中的乱码字符
function fixGibberish(filePath) {
  try {
    // 读取文件内容
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 保存原始内容，用于比较
    const originalContent = content;
    
    // 替换所有乱码字符
    Object.entries(replacementMap).forEach(([gibberish, correct]) => {
      content = content.replace(new RegExp(gibberish, 'g'), correct);
    });
    
    // 如果内容有变化，写入文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`修复成功: ${filePath}`);
    } else {
      console.log(`无需修复: ${filePath}`);
    }
    
    return true;
  } catch (error) {
    console.error(`修复失败: ${filePath}，错误: ${error.message}`);
    return false;
  }
}

// 主函数
function main() {
  console.log('开始修复前端文件乱码问题...');
  console.log(`共需修复 ${filesWithGibberish.length} 个文件`);
  
  let successCount = 0;
  let failCount = 0;
  
  // 逐个修复文件
  for (const filePath of filesWithGibberish) {
    if (fixGibberish(filePath)) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('\n修复完成!');
  console.log(`成功修复: ${successCount} 个文件`);
  console.log(`修复失败: ${failCount} 个文件`);
  
  // 检查是否还有未修复的乱码
  console.log('\n检查是否还有未修复的乱码...');
  
  let remainingGibberish = 0;
  for (const filePath of filesWithGibberish) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('�')) {
        remainingGibberish++;
        console.log(`文件 ${filePath} 中仍存在乱码`);
      }
    } catch (error) {
      console.error(`检查失败: ${filePath}，错误: ${error.message}`);
    }
  }
  
  console.log(`\n检查完成!`);
  console.log(`仍存在乱码的文件数: ${remainingGibberish}`);
}

// 执行主函数
main();
