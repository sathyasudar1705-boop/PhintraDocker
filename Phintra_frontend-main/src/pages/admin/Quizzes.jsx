import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Award, Plus, Eye, Trash2, HelpCircle, FileText } from 'lucide-react';
import Button from '../../components/common/Button';

const AdminQuizzes = () => {
  const { quizzes, addQuiz, deleteQuiz } = useAppContext();
  const confirm = useConfirm();

  // Modal States
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form Fields (Create Quiz)
  const [quizName, setQuizName] = useState('');
  const [passingScore, setPassingScore] = useState(80);
  const [questions, setQuestions] = useState([
    {
      questionText: 'What is spear phishing?',
      options: ['Phishing with a literal spear', 'A highly personalized phishing attack targeting a specific individual or team', 'Mass spam email newsletters', 'A firewall rule configuration'],
      correctIndex: 1
    }
  ]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Quiz?',
      description: 'This action cannot be undone. The quiz will be permanently removed.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteQuiz(id);
    }
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctIndex: 0
      }
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx, text) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, questionText: text } : q));
  };

  const handleOptionChange = (qIdx, oIdx, text) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i === qIdx) {
        const newOptions = [...q.options];
        newOptions[oIdx] = text;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleCorrectIndexChange = (qIdx, correctVal) => {
    setQuestions(prev => prev.map((q, i) => i === qIdx ? { ...q, correctIndex: parseInt(correctVal) } : q));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!quizName) {
      setError('Quiz title is required.');
      return;
    }

    // Validate that questions have content and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} text is empty.`);
        return;
      }
      const filledOptions = q.options.filter(o => o.trim() !== '');
      if (filledOptions.length < 2) {
        setError(`Question ${i + 1} needs at least 2 non-empty options.`);
        return;
      }
    }

    addQuiz({
      quizName,
      questionsCount: questions.length,
      passingScore: parseInt(passingScore),
      questions
    });

    setSuccess('Quiz created successfully!');
    setTimeout(() => {
      setShowCreateModal(false);
      setQuizName('');
      setPassingScore(80);
      setQuestions([
        {
          questionText: 'What is spear phishing?',
          options: ['Phishing with a literal spear', 'A highly personalized phishing attack targeting a specific individual or team', 'Mass spam email newsletters', 'A firewall rule configuration'],
          correctIndex: 1
        }
      ]);
      setSuccess('');
    }, 1000);
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Evaluation Quizzes</h1>
          <p>Inspect course quizzes, passing grades, question sheets, and build new evaluations.</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          icon={Plus}
        >
          Create Quiz
        </Button>
      </div>

      {/* Quizzes Table */}
      {quizzes.length === 0 ? (
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
          <Award size={48} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
          <h3>No quizzes constructed</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Build a multiple-choice quiz and tie it to training courses.</p>
        </div>
      ) : (
        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Quiz Name</th>
                <th>Question Count</th>
                <th>Passing Threshold</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} style={{ color: 'var(--text-light)' }} />
                      <span>{quiz.quizName}</span>
                    </div>
                  </td>
                  <td>{quiz.questionsCount} Questions</td>
                  <td>
                    <span className="badge badge-reported" style={{ fontWeight: '600' }}>
                      {quiz.passingScore}% Pass Rate
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-light)' }}>{quiz.createdDate}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button 
                        onClick={() => setSelectedQuiz(quiz)}
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        style={{ padding: '6px' }}
                        title="Preview Quiz Sheet"
                      />
                      <Button 
                        onClick={() => handleDelete(quiz.id)}
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        style={{ padding: '6px' }}
                        title="Delete Quiz"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 1. Quiz Preview modal */}
      {selectedQuiz && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Quiz Sheet Blueprint</h2>
              <button onClick={() => setSelectedQuiz(null)} className="close-btn">&times;</button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{selectedQuiz.quizName}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>
                  Threshold: <strong style={{ color: 'var(--color-teal)' }}>{selectedQuiz.passingScore}% Correct answers</strong> required to pass
                </p>
              </div>

              {/* Questions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                {selectedQuiz.questions ? selectedQuiz.questions.map((q, qIdx) => (
                  <div key={qIdx} style={{
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--text-main)', marginBottom: '10px' }}>
                      <HelpCircle size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                      <span>{qIdx + 1}. {q.questionText}</span>
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '24px' }}>
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === q.correctIndex;
                        return (
                          <div 
                            key={oIdx} 
                            style={{ 
                              fontSize: '13px', 
                              color: isCorrect ? 'var(--color-success-hover)' : 'var(--text-muted)',
                              fontWeight: isCorrect ? '600' : '400',
                              backgroundColor: isCorrect ? 'var(--color-success-light)' : 'transparent',
                              padding: isCorrect ? '4px 8px' : '0',
                              borderRadius: '4px',
                              display: 'inline-block',
                              width: 'fit-content'
                            }}
                          >
                            &bull; {opt} {isCorrect && " (Correct Answer)"}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )) : (
                  <p style={{ color: 'var(--text-light)', fontSize: '13px' }}>No questions configured for this mock quiz sheet.</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <Button onClick={() => setSelectedQuiz(null)} variant="primary">Close Sheet</Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Create Quiz Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2>Quiz Builder Panel</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {error && (
                  <div style={{
                    backgroundColor: 'var(--color-danger-light)',
                    color: 'var(--color-danger)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div style={{
                    backgroundColor: 'var(--color-success-light)',
                    color: 'var(--color-success-hover)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '550'
                  }}>
                    {success}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Quiz Sheet Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Recognizing BEC Attack vectors"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Passing Threshold (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="10"
                    max="100"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    required
                  />
                </div>

                {/* Questions Section */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600' }}>Quiz Questions</h3>
                    <Button 
                      type="button" 
                      onClick={handleAddQuestion}
                      variant="outline"
                      size="sm"
                    >
                      + Add Question
                    </Button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {questions.map((q, qIdx) => (
                      <div key={qIdx} style={{
                        border: '1px solid var(--border-hover)',
                        borderRadius: '8px',
                        padding: '16px',
                        backgroundColor: 'var(--bg-main)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-primary)' }}>Question {qIdx + 1}</span>
                          <Button 
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            variant="danger"
                            size="sm"
                            disabled={questions.length === 1}
                          >
                            Remove Question
                          </Button>
                        </div>

                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Type the question..."
                            value={q.questionText}
                            onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <label className="form-label">Multiple Choice Options</label>
                          {[0, 1, 2, 3].map((optIdx) => (
                            <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="radio"
                                name={`correct-${qIdx}`}
                                checked={q.correctIndex === optIdx}
                                onChange={() => handleCorrectIndexChange(qIdx, optIdx)}
                                style={{ cursor: 'pointer' }}
                              />
                              <input
                                type="text"
                                className="form-control"
                                placeholder={`Option ${optIdx + 1}`}
                                value={q.options[optIdx] || ''}
                                onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                style={{ padding: '6px 10px', fontSize: '13px' }}
                                required={optIdx < 2} // At least 2 options required
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Publish Quiz</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminQuizzes;
