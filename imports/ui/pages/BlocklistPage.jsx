import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Blocklist } from '/imports/api/blocklist/collection';
import { Meteor } from 'meteor/meteor';

export default function BlocklistPage() {
  const { blocklist, isLoading } = useTracker(() => {
    const sub = Meteor.subscribe('blocklist');
    return {
      isLoading: !sub.ready(),
      blocklist: Blocklist.find({}, { sort: { createdAt: -1 } }).fetch(),
    };
  });

  const [word, setWord] = useState('');
  const [category, setCategory] = useState('');

  const handleAdd = () => {
    if (word && category) {
      Meteor.call('blocklist.insert', word, category);
      setWord('');
      setCategory('');
    }
  };

  const handleDelete = (id) => {
    Meteor.call('blocklist.remove', id);
  };

  if (isLoading) return <div className="container-xl">Loading...</div>;

  return (
    <div className="page">
      <div className="container-xl mt-4">
        <h2 className="page-title">屏蔽词管理</h2>

        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-2">
              <div className="col">
                <input
                  type="text"
                  placeholder="屏蔽词"
                  className="form-control"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                />
              </div>
              <div className="col">
                <input
                  type="text"
                  placeholder="分类（如辱骂类）"
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="col-auto">
                <button className="btn btn-primary" onClick={handleAdd}>添加</button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <table className="table table-vcenter">
              <thead>
                <tr>
                  <th>词语</th>
                  <th>分类</th>
                  <th>创建时间</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {blocklist.map((item) => (
                  <tr key={item._id}>
                    <td>{item.word}</td>
                    <td>{item.category}</td>
                    <td>{item.createdAt.toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
