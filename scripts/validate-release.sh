#!/usr/bin/env sh
set -eu

root="$(unset CDPATH && cd -- "$(dirname -- "$0")/.." && pwd)"
exec "$root/scripts/validate.sh"
