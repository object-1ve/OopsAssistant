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
 */
export const resolveCommand = (
  command: string, 
  paramValues: Record<string, string>,
  defaultToPlaceholder: boolean = true
): string => {
  return command.replace(PLACEHOLDER_REGEX, (match, p1, p2, p3, p4) => {
    const name = (p1 || p2 || p3 || p4).trim();
    return paramValues[name] || (defaultToPlaceholder ? match : '');
  });
};
