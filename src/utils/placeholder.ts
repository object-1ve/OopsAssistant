/**
 * 正则表达式用于匹配常见的占位符格式：
 * 1. <param>
 * 2. {{param}}
 * 3. [param]
 * 4. {param}
 */
export const PLACEHOLDER_REGEX = /<([^>]+)>|\{\{([^}]+)\}\}|\[([^\]\s]+)\]|\{([^{},\s]+)\}/g;

export interface ExtractedParam {
  name: string;
  placeholder: string; // 完整的占位符字符串，例如 "<url>"
}

/**
 * 从命令字符串中提取所有占位符
 */
export const extractParams = (command: string): ExtractedParam[] => {
  const params: ExtractedParam[] = [];
  const seen = new Set<string>();
  
  let match;
  // 重置正则状态
  PLACEHOLDER_REGEX.lastIndex = 0;
  
  while ((match = PLACEHOLDER_REGEX.exec(command)) !== null) {
    const fullMatch = match[0];
    const name = (match[1] || match[2] || match[3] || match[4]).trim();
    
    if (name && !seen.has(name)) {
      params.push({ name, placeholder: fullMatch });
      seen.add(name);
    }
  }
  
  return params;
};

/**
 * 将命令中的占位符替换为实际值
 * 
 * 支持 [] 可选块语法：
 * 1. 如果 [] 内部包含未填充的占位符，则整个 [] 块会被移除
 * 2. 如果 [] 内部所有占位符都已填充，或者没有占位符，则保留内容并移除 []
 * 3. 例外：如果整个 [param] 本身就是一个占位符且未填充，则根据 defaultToPlaceholder 保留或移除
 */
export const resolveCommand = (
  command: string, 
  paramValues: Record<string, string>,
  defaultToPlaceholder: boolean = true
): string => {
  // 1. 首先替换所有基础占位符
  let resolved = command.replace(PLACEHOLDER_REGEX, (match, p1, p2, p3, p4) => {
    const name = (p1 || p2 || p3 || p4).trim();
    if (paramValues[name] !== undefined && paramValues[name] !== '') {
      return paramValues[name];
    }
    return defaultToPlaceholder ? match : '';
  });

  // 2. 处理 [] 可选块
  // 使用正则表达式匹配所有 [ ... ] 结构
  const OPTIONAL_BLOCK_REGEX = /\[([\s\S]*?)\]/g;
  
  resolved = resolved.replace(OPTIONAL_BLOCK_REGEX, (match, content) => {
    // 检查这个匹配项是否本身就是一个基础占位符（如 [repo]）
    // 需要重置正则状态，因为它是全局的
    PLACEHOLDER_REGEX.lastIndex = 0;
    const placeholderMatch = PLACEHOLDER_REGEX.exec(match);
    if (placeholderMatch && placeholderMatch[0] === match) {
      // 如果整个块就是一个未填充的占位符，保持原样（第一步已经处理过了）
      return match;
    }

    // 检查内容中是否还含有未填充的占位符
    PLACEHOLDER_REGEX.lastIndex = 0;
    if (PLACEHOLDER_REGEX.test(content)) {
      // 含有未填充的占位符，移除整个可选块
      return '';
    }

    // 所有占位符已填充或没有占位符，移除括号保留内容
    return content;
  });

  // 清理多余空格
  return resolved.replace(/\s+/g, ' ').trim();
};
