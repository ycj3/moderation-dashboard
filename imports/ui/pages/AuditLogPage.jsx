import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ModerateLogs } from '/imports/api/moderation/collection';

const PAGE_SIZE = 10;

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    Meteor.call('moderation.count', (err, result) => {
      if (!err) setTotal(result);
    });
  }, []);

  const { logs, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('moderateLogs', page, PAGE_SIZE);
    return {
      isLoading: !handle.ready(),
      logs: ModerateLogs.find({}, { sort: { createdAt: -1 } }).fetch(),
    };
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDelete = (_id) => {
    if (confirm('确认要删除这条审核记录？')) {
      Meteor.call('moderation.delete', _id);
    }
  };

  return (
    <div className="container-xl mt-4">
      <h2 className="page-title">审核记录</h2>

      <div className="card">
        <div className="card-body table-responsive">
          <table className="table table-vcenter">
            <thead>
              <tr>
                <th>消息</th>
                <th>用户</th>
                <th>内容</th>
                <th>审核结果</th>
                <th>时间</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id}>
                  <td>{log.messageId}</td>
                  <td>{log.senderId}</td>
                  <td>{log.content}</td>
                  <td>
                    {log.moderation?.categoriesAnalysis?.map((c, i) => (
                      <span key={i} className="badge bg-azure me-1">
                        {c.category}:{c.severity}
                      </span>
                    ))}
                  </td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(log._id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 d-flex justify-content-between align-items-center">
            <span>第 {page} 页 / 共 {totalPages} 页</span>
            <div>
              <button className="btn btn-outline-primary btn-sm me-2" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                上一页
              </button>
              <button className="btn btn-outline-primary btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
