module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2, // error
            'always',
            [
                'feat',
                'fix',
                'docs',
                'style', // 代码格式、无影响的重构
                'refactor', // 有影响的重构
                'perf', // 性能优化
                'test',
                'chore', // 构建过程或辅助工具的变动
                'revert', // 撤销某个提交
                'build', // 影响构建系统或外部依赖的变动
                'wip', // 开发中
                'ci'
            ]
        ]
    }
}
