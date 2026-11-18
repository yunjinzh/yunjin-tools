#!/bin/sh
# 把脚本和 .001—.025 放在同一目录，再执行 sh merge-macos-linux.sh。
set -eu
cd "$(dirname "$0")"
base='苗苗汉字学习卡_全套1000张.zip'
result='苗苗原图_合并结果'
full_size=100663296
last_size=87975966
expected_total=2503895070
die() { printf '停止：%s\n' "$*" >&2; exit 1; }
command -v unzip >/dev/null 2>&1 || die '请先安装 unzip，并重新执行。'
printf '核对 25 个分卷的文件名与字节数……\n'
i=1
while [ "$i" -le 25 ]; do
  n=$(printf '%03d' "$i")
  part="./$base.$n"
  [ -f "$part" ] && [ ! -L "$part" ] || die "缺少普通文件 $base.$n，请从分卷文件夹补下载。"
  actual=$(wc -c < "$part" | tr -d '[:space:]')
  expected=$full_size
  if [ "$i" -eq 25 ]; then expected=$last_size; fi
  [ "$actual" = "$expected" ] || die "$base.$n 的实际大小为 $actual 字节，清单为 $expected 字节。"
  i=$((i+1))
done
# 创建专用输出目录，防止覆盖已有成品。
mkdir "$result" || die "无法创建 $result。请检查同名目录或剩余空间。"
temp="$result/.merging.zip"
finish() {
  rm -f "$temp"
  rmdir "$result" 2>/dev/null || :
}
trap finish EXIT
trap 'exit 1' HUP INT TERM
i=1
while [ "$i" -le 25 ]; do
  n=$(printf '%03d' "$i")
  printf '合并 %s / 025\n' "$n"
  cat "./$base.$n" >> "$temp"
  i=$((i+1))
done
[ "$(wc -c < "$temp" | tr -d '[:space:]')" = "$expected_total" ] || die '合并后的字节数与清单不符。'
printf '正在逐条测试 ZIP 数据与 CRC，请保持窗口开启……\n'
unzip -tqq "$temp" || die '压缩包完整性测试失败，请核对下载记录并重新下载异常分卷。'
if command -v shasum >/dev/null 2>&1; then
  digest=$(shasum -a 256 "$temp" | awk '{print $1}')
elif command -v sha256sum >/dev/null 2>&1; then
  digest=$(sha256sum "$temp" | awk '{print $1}')
else
  die '请安装 shasum 或 sha256sum 后重试。'
fi
[ "$digest" = "36038b3a524d1737a1f6315c90cdc2b6f03d77490efe7e5980699be47d36c072" ] || die '合并 ZIP 的 SHA-256 与基准不符，请在工作台逐卷比对。'
mv "$temp" "$result/$base"
trap - EXIT HUP INT TERM
printf '完整性测试通过。成品：%s/%s\n请在新建空目录中解压，随后登记卡片内容复核。\n' "$result" "$base"
