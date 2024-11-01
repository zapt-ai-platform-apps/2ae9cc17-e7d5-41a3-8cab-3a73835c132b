import { createSignal, onMount, createEffect, Show } from 'solid-js';
import { supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate, Router, Routes, Route } from '@solidjs/router';

function App() {
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const navigate = useNavigate();

  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
      navigate('/home');
    }
  };

  onMount(checkUserSignedIn);

  createEffect(() => {
    const authListener = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('homePage');
        navigate('/home');
      } else {
        setUser(null);
        setCurrentPage('login');
        navigate('/');
      }
    });

    return () => {
      authListener.data.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
    navigate('/');
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4 text-gray-800">
      <Router>
        <Routes>
          <Route path="/" element={
            <Show
              when={currentPage() === 'homePage'}
              fallback={
                <div class="flex items-center justify-center h-full">
                  <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
                    <h2 class="text-3xl font-bold mb-6 text-center text-purple-600">تسجيل الدخول باستخدام ZAPT</h2>
                    <a
                      href="https://www.zapt.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-blue-500 hover:underline mb-6 block text-center"
                    >
                      تعلم المزيد عن ZAPT
                    </a>
                    <Auth
                      supabaseClient={supabase}
                      appearance={{ theme: ThemeSupa }}
                      providers={['google', 'facebook', 'apple']}
                      magicLink={true}
                      showLinks={false}
                      view="magic_link"
                    />
                  </div>
                </div>
              }
            >
              <HomePage onSignOut={handleSignOut} />
            </Show>
          } />
          <Route path="/home" element={<HomePage onSignOut={handleSignOut} />} />
        </Routes>
      </Router>
    </div>
  );
}

function HomePage(props) {
  const [projectName, setProjectName] = createSignal('');
  const [language, setLanguage] = createSignal('');
  const [projectType, setProjectType] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [result, setResult] = createSignal('');

  const handleCreateProject = async () => {
    if (!projectName() || !language() || !projectType()) return;
    setLoading(true);
    try {
      const response = await createEvent('chatgpt_request', {
        prompt: `أود أن أنشئ مشروع ${projectType()} باسم "${projectName()}" باستخدام لغة البرمجة ${language()}. قم بإنشاء خطوات تفصيلية لكيفية البدء في هذا المشروع.`,
        response_type: 'text'
      });
      setResult(response);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-4xl mx-auto h-full">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold text-purple-600">منشئو المشاريع على الإنترنت</h1>
        <button
          class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
          onClick={props.onSignOut}
        >
          تسجيل الخروج
        </button>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 class="text-2xl font-bold mb-4 text-purple-600">ابدأ مشروعًا جديدًا</h2>
        <div class="space-y-4">
          <input
            type="text"
            placeholder="اسم المشروع"
            value={projectName()}
            onInput={(e) => setProjectName(e.target.value)}
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent box-border"
            required
          />
          <select
            value={projectType()}
            onChange={(e) => setProjectType(e.target.value)}
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent cursor-pointer"
            required
          >
            <option value="" disabled>اختر نوع المشروع</option>
            <option value="موقع إلكتروني">موقع إلكتروني</option>
            <option value="تطبيق">تطبيق</option>
          </select>
          <select
            value={language()}
            onChange={(e) => setLanguage(e.target.value)}
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent cursor-pointer"
            required
          >
            <option value="" disabled>اختر لغة البرمجة</option>
            <option value="جافا سكريبت">جافا سكريبت</option>
            <option value="بايثون">بايثون</option>
            <option value="جافا">جافا</option>
            <option value="سي شارب">سي شارب</option>
            <option value="سي بلس بلس">سي بلس بلس</option>
            <option value="روبي">روبي</option>
            <option value="بي إتش بي">بي إتش بي</option>
            <option value="سويفت">سويفت</option>
          </select>
          <button
            onClick={handleCreateProject}
            class={`w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading()}
          >
            <Show when={loading()} fallback="إنشاء المشروع">
              جارٍ التحميل...
            </Show>
          </button>
        </div>
      </div>

      <Show when={result()}>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-bold mb-4 text-purple-600">نتيجة المشروع</h2>
          <p class="whitespace-pre-wrap">{result()}</p>
        </div>
      </Show>
    </div>
  );
}

export default App;