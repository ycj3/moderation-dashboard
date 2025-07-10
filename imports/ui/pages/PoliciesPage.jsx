import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';

const messageTypes = ['txt', 'custom'];
const actions = ["No Action", "Replace With Asterisks (*)", "Block From Sending"];

export default function PoliciesPage() {
    const [policies, setPolicies] = useState([]);
    const [draftPolicies, setDraftPolicies] = useState({});
  
    useEffect(() => {
      Meteor.call('moderation.getPolicies', (err, res) => {
        if (!err) {
          setPolicies(res);
          const draft = {};
          res.forEach(p => {
            draft[p.type] = { action: p.action || '', field: p.fields?.[0] || '' };
          });
          setDraftPolicies(draft);
        }
      });
    }, []);
  
    const handleDraftChange = (type, key, value) => {
      setDraftPolicies(prev => ({
        ...prev,
        [type]: {
          ...(prev[type] || {}),
          [key]: value
        }
      }));
    };
  
    const handleSave = (type) => {
      const draft = draftPolicies[type];
      if (!draft) return;
      if (draft.action) {
        Meteor.call('moderation.setPolicy', { type, action: draft.action });
      }
      if (type === 'custom' && draft.field) {
        Meteor.call('moderation.setPolicyFields', { type, fields: [draft.field] });
      }
      setPolicies(prev => {
        const existing = prev.find(p => p.type === type);
        if (existing) {
          return prev.map(p =>
            p.type === type ? { ...p, action: draft.action, fields: [draft.field] } : p
          );
        } else {
          return [...prev, { type, action: draft.action, fields: [draft.field] }];
        }
      });
    };
  
    return (
      <div className="container py-4">
        <h2 className="mb-4">Moderation Policy Settings</h2>
  
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h4 className="fw-bold mb-3">Message Type Policies</h4>
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '160px' }}>Message Type</th>
                  <th style={{ width: '220px' }}>Action</th>
                  <th>Audit Field (for 'custom' type only)</th>
                  <th style={{ width: '100px' }}></th>
                </tr>
              </thead>
              <tbody>
                {messageTypes.map((type) => {
                  const draft = draftPolicies[type] || {};
                  return (
                    <tr key={type}>
                      <td><strong>{type}</strong></td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={draft.action || ''}
                          onChange={(e) => handleDraftChange(type, 'action', e.target.value)}
                        >
                          <option value="">-- No Action --</option>
                          {actions.map((a) => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {type === 'custom' && (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. v2:customExts.msg"
                            value={draft.field || ''}
                            onChange={(e) => handleDraftChange(type, 'field', e.target.value)}
                          />
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleSave(type)}
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }