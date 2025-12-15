export type DiffOp = { type: 'add' | 'del' | 'same'; text: string };

function lcs(a: string[], b: string[]): number[][] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

export function diffByLines(oldText: string, newText: string): DiffOp[] {
  const a = oldText.replace(/\r\n/g, '\n').split('\n');
  const b = newText.replace(/\r\n/g, '\n').split('\n');
  const dp = lcs(a, b);

  const ops: DiffOp[] = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      ops.push({ type: 'same', text: a[i - 1] });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push({ type: 'del', text: a[i - 1] });
      i--;
    } else {
      ops.push({ type: 'add', text: b[j - 1] });
      j--;
    }
  }
  while (i > 0) {
    ops.push({ type: 'del', text: a[i - 1] });
    i--;
  }
  while (j > 0) {
    ops.push({ type: 'add', text: b[j - 1] });
    j--;
  }

  ops.reverse();
  return ops;
}


