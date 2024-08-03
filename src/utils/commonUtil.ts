export function is_specific_suffix(mainStr: string, subStr: string) {
  return (
    mainStr.endsWith(subStr + ".testnet") || mainStr.endsWith(subStr + ".near")
  );
}
