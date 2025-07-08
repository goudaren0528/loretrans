# Loretrans 数据库性能监控与优化

## 1. 概述

本文件记录了 Loretrans 平台的数据库性能监控方法和已实施的优化策略。一个高性能的数据库是提供流畅、快速用户体验的基石。

## 2. 性能监控

### 2.1 使用 Supabase Query Performance 工具

Supabase 提供了一个内置的查询性能分析工具，可以帮助我们识别慢查询和缺失的索引。

**如何使用**:
1.  登录您的 [Supabase 账户](https://app.supabase.com/)。
2.  进入您的项目，导航到 **Reports** -> **Query Performance**。
3.  该报告会列出最耗时、最频繁以及可能需要索引的查询。
4.  定期（例如，每周）审查此报告，是主动发现并解决性能瓶颈的关键。

### 2.2 使用 `EXPLAIN` 命令

对于特定的复杂查询，您可以使用 PostgreSQL 的 `EXPLAIN` 命令来查看其执行计划。

**如何使用**:
- 在 Supabase SQL Editor 中，将您的查询语句放在 `EXPLAIN` 关键字之后执行。
- `EXPLAIN (ANALYZE, BUFFERS)` 提供了更详细的实际执行信息。

**示例**:
```sql
EXPLAIN ANALYZE
SELECT * FROM public.credit_transactions
WHERE user_id = 'some-user-id'
ORDER BY created_at DESC
LIMIT 10;
```

通过分析执行计划，您可以判断查询是否有效地利用了索引（例如，看到 `Index Scan` 而不是 `Seq Scan`）。

## 3. 索引优化策略

索引是提升数据库查询性能最有效的方式之一。我们已经为数据库中的关键字段和查询模式添加了索引。

### 3.1 现有索引回顾 (截至 `001_...`)

- **外键索引**: 所有 `user_id` 字段都已建立索引，以加速表连接和按用户进行的筛选。
- **常用筛选字段**: `users.email`, `payments.status`, `credit_transactions.type` 等常用作查询条件的列也已建立索引。
- **排序优化**: `credit_transactions(user_id, created_at DESC)` 复合索引专门用于高效地获取用户的最新交易记录。

### 3.2 增补性能优化 (截至 `006_...`)

在 `006_performance_optimizations.sql` 迁移中，我们添加了以下索引：

1.  **用户姓名模糊搜索 (`user_profiles.name`)**:
    - **索引类型**: `GIN` 索引，配合 `pg_trgm` 扩展。
    - **原因**: 标准的 B-tree 索引对 `LIKE '%keyword%'` 这样的模糊搜索无能为力。GIN 索引专门用于加速对文本中子字符串的搜索，极大地提升了未来按用户名搜索功能的性能。

2.  **用户支付状态查询 (`payments(user_id, status)`)**:
    - **索引类型**: 复合 B-tree 索引。
    - **原因**: 这是一个非常典型的查询场景（例如，"获取用户X所有已完成的付款"）。通过创建覆盖 `user_id` 和 `status` 的复合索引，数据库可以更快速地定位到目标数据行，而无需扫描该用户的所有支付记录。

3.  **用户特定交易类型查询 (`credit_transactions(user_id, type, created_at DESC)`)**:
    - **索引类型**: 复合 B-tree 索引。
    - **原因**: 优化了按特定交易类型（如 `consume` 或 `purchase`）查询用户历史记录的场景，这在生成分类账单或统计数据时非常有用。

## 4. 查询最佳实践

除了索引，编写高效的查询语句同样重要。

- **避免 `SELECT *`**: 只选择您需要的列。这可以减少数据传输量和内存消耗。
- **使用 `JOIN` 而不是子查询**: 在大多数情况下，`JOIN` 的性能优于等效的子查询。
- **`WHERE` 子句的顺序**: 将选择性最高（能过滤掉最多数据）的条件放在前面。
- **分页查询**: 对于可能返回大量数据的查询，务必使用 `LIMIT` 和 `OFFSET` (或基于游标的分页) 来避免一次性加载过多数据。
- **善用数据库函数和视图**: 对于复杂的计算或数据转换，可以将其封装在数据库函数或视图中，以简化应用逻辑并可能利用数据库的优化。

---
**最后更新:** 2025-01-25
**版本:** 1.0
**负责人:** 开发团队 