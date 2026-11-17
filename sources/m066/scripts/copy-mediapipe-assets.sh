#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_root="${project_root}/node_modules/@mediapipe/tasks-vision/wasm"
target_root="${project_root}/public/mediapipe/wasm"
legacy_root="${project_root}/public/mediapipe"

mkdir -p "${target_root}"

rm -f \
  "${legacy_root}/selfie_segmentation.js" \
  "${legacy_root}/selfie_segmentation.binarypb" \
  "${legacy_root}/selfie_segmentation.tflite" \
  "${legacy_root}/selfie_segmentation_landscape.tflite" \
  "${legacy_root}/selfie_segmentation_solution_simd_wasm_bin.data" \
  "${legacy_root}/selfie_segmentation_solution_simd_wasm_bin.js" \
  "${legacy_root}/selfie_segmentation_solution_simd_wasm_bin.wasm" \
  "${legacy_root}/selfie_segmentation_solution_wasm_bin.js" \
  "${legacy_root}/selfie_segmentation_solution_wasm_bin.wasm"

cp "${source_root}"/* "${target_root}/"
